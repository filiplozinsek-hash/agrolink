import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const isDemoMode = !STRIPE_KEY || STRIPE_KEY.startsWith('pk_test_your')
const stripePromise = isDemoMode ? null : loadStripe(STRIPE_KEY)

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#3D5C34',
    colorBackground: '#FDFAF4',
    colorText: '#2C1A0E',
    colorDanger: '#ef4444',
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: '12px',
  }
}

function StripeCheckoutForm({ clientSecret, amount, deliveryAddress, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/order-success' },
      redirect: 'if_required'
    })

    if (result.error) {
      setError(result.error.message)
      setProcessing(false)
    } else {
      onSuccess(result.paymentIntent?.id || 'pi_demo')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="label mb-2">Payment Details</label>
        <div className="stripe-element-container">
          <PaymentElement />
        </div>
      </div>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {processing ? <LoadingSpinner size="sm" color="white" /> : `Pay €${amount.toFixed(2)}`}
      </button>
      <p className="text-center text-xs font-body text-bark/50 mt-3">🔒 Secured by Stripe</p>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user, authFetch } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState('address')
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(total)
  const [demoMode, setDemoMode] = useState(isDemoMode)
  const [creatingIntent, setCreatingIntent] = useState(false)
  const [processingDemo, setProcessingDemo] = useState(false)

  const [address, setAddress] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenia'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (items.length === 0) navigate('/cart')
  }, [items, navigate])

  const validateAddress = () => {
    const e = {}
    if (!address.name.trim()) e.name = 'Full name is required'
    if (!address.address.trim()) e.address = 'Street address is required'
    if (!address.city.trim()) e.city = 'City is required'
    if (!address.postalCode.trim()) e.postalCode = 'Postal code is required'
    return e
  }

  const handleAddressContinue = async (e) => {
    e.preventDefault()
    const errs = validateAddress()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setCreatingIntent(true)
    try {
      const res = await authFetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ items: items.map(i => ({ productId: i.id, quantity: i.quantity })) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setPaymentAmount(data.amount)
      setDemoMode(data.demoMode || isDemoMode)
      if (data.clientSecret) setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err) {
      addToast(err.message || 'Failed to initialize payment', 'error')
    } finally {
      setCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          deliveryAddress: address,
          stripePaymentId: paymentIntentId,
          items: items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price }))
        })
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      clearCart()
      addToast('Order placed successfully! 🎉')
      navigate('/order-success', { state: { order } })
    } catch (err) {
      addToast(err.message || 'Order creation failed', 'error')
    }
  }

  const handleDemoPayment = async () => {
    setProcessingDemo(true)
    await new Promise(r => setTimeout(r, 1200))
    await handlePaymentSuccess('demo_' + Date.now())
    setProcessingDemo(false)
  }

  const deliveryEstimate = 3.50
  const f = (key) => ({
    value: address[key],
    onChange: e => setAddress({ ...address, [key]: e.target.value })
  })

  return (
    <div className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl text-soil mb-2">Checkout</h1>
        <div className="flex items-center gap-2 mb-10">
          {['address', 'payment'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-0.5 bg-mist" />}
              <div className={`flex items-center gap-2 text-sm font-body ${step === s ? 'text-moss font-semibold' : step === 'payment' && s === 'address' ? 'text-bark/60' : 'text-bark/40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-moss text-white' : step === 'payment' && s === 'address' ? 'bg-mist text-bark/60' : 'bg-mist text-bark/30'}`}>
                  {i + 1}
                </div>
                {s === 'address' ? 'Delivery' : 'Payment'}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-2">
            {step === 'address' && (
              <div className="bg-white rounded-card p-8 border border-mist">
                <h2 className="font-display font-semibold text-xl text-soil mb-6">Delivery Address</h2>
                <form onSubmit={handleAddressContinue} className="space-y-4" noValidate>
                  <div>
                    <label className="label">Full name</label>
                    <input {...f('name')} type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="Name on delivery" />
                    {errors.name && <p className="mt-1 text-xs text-red-600 font-body">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Street address</label>
                    <input {...f('address')} type="text" className={`input-field ${errors.address ? 'border-red-400' : ''}`} placeholder="Slovenska cesta 1" />
                    {errors.address && <p className="mt-1 text-xs text-red-600 font-body">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input {...f('city')} type="text" className={`input-field ${errors.city ? 'border-red-400' : ''}`} placeholder="Ljubljana" />
                      {errors.city && <p className="mt-1 text-xs text-red-600 font-body">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="label">Postal code</label>
                      <input {...f('postalCode')} type="text" className={`input-field ${errors.postalCode ? 'border-red-400' : ''}`} placeholder="1000" />
                      {errors.postalCode && <p className="mt-1 text-xs text-red-600 font-body">{errors.postalCode}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <select {...f('country')} className="input-field">
                      <option>Slovenia</option>
                      <option>Austria</option>
                      <option>Croatia</option>
                      <option>Italy</option>
                      <option>Germany</option>
                    </select>
                  </div>
                  <button type="submit" disabled={creatingIntent} className="btn-primary w-full justify-center py-4 mt-2">
                    {creatingIntent ? <LoadingSpinner size="sm" color="white" /> : 'Continue to Payment →'}
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-card p-8 border border-mist">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-xl text-soil">Payment</h2>
                  <button onClick={() => setStep('address')} className="text-moss text-sm font-body hover:underline">
                    ← Edit address
                  </button>
                </div>

                {demoMode ? (
                  <div>
                    <div className="mb-6 p-4 bg-hay/10 border border-hay/30 rounded-xl">
                      <p className="text-sm font-body text-bark font-medium mb-1">🔧 Demo Mode</p>
                      <p className="text-xs font-body text-bark/70">
                        Stripe keys not configured. Click below to simulate a successful payment and create your order.
                        Add your Stripe keys to <code className="bg-mist px-1 rounded">client/.env</code> to enable real payments.
                      </p>
                    </div>
                    <div className="mb-6 p-4 bg-mist rounded-xl text-xs font-body text-bark/70">
                      <strong>Test card:</strong> 4242 4242 4242 4242 · Any future date · Any CVC
                    </div>
                    <button
                      onClick={handleDemoPayment}
                      disabled={processingDemo}
                      className="btn-primary w-full justify-center py-4 text-base"
                    >
                      {processingDemo ? <LoadingSpinner size="sm" color="white" /> : `Place Order · €${(paymentAmount + deliveryEstimate).toFixed(2)}`}
                    </button>
                    <p className="text-center text-xs font-body text-bark/50 mt-3">🔒 Demo mode — no real charge</p>
                  </div>
                ) : (
                  clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
                      <StripeCheckoutForm
                        clientSecret={clientSecret}
                        amount={paymentAmount + deliveryEstimate}
                        deliveryAddress={address}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  )
                )}
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="bg-white rounded-card p-5 border border-mist sticky top-24">
              <h3 className="font-display font-semibold text-soil mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-mist flex items-center justify-center overflow-hidden shrink-0">
                      {item.image_path
                        ? <img src={item.image_path} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-lg">🌿</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body font-medium text-soil line-clamp-1">{item.name}</p>
                      <p className="text-xs font-body text-bark/50">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-body font-semibold text-soil shrink-0">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-mist pt-3 space-y-2 text-sm font-body">
                <div className="flex justify-between text-bark/70"><span>Subtotal</span><span>€{total.toFixed(2)}</span></div>
                <div className="flex justify-between text-bark/70"><span>Delivery</span><span>€{deliveryEstimate.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-soil text-base border-t border-mist pt-2">
                  <span>Total</span>
                  <span className="font-display text-lg">€{(total + deliveryEstimate).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
