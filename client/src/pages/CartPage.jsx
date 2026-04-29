import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const categoryEmoji = {
  vegetables: '🥦', dairy: '🧀', honey: '🍯', meat: '🥩', fruit: '🍎', other: '🌿'
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Group by farm
  const groupedByFarm = items.reduce((acc, item) => {
    const key = item.farm_name || 'Unknown Farm'
    if (!acc[key]) acc[key] = { farm_name: key, farm_id: item.farm_id, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  const deliveryEstimate = items.length > 0 ? 3.50 : 0

  const handleCheckout = () => {
    if (!user) navigate('/login', { state: { from: { pathname: '/checkout' } } })
    else navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-6">🛍️</div>
        <h1 className="font-display text-3xl text-soil mb-3">Your cart is empty</h1>
        <p className="text-bark/60 font-body text-sm mb-8 max-w-xs">
          Looks like you haven't added anything yet. Browse the market to find fresh seasonal produce.
        </p>
        <Link to="/market" className="btn-primary">Browse the Market →</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl md:text-4xl text-soil mb-2">Your Cart</h1>
        <p className="text-bark/60 font-body text-sm mb-10">{count} item{count !== 1 ? 's' : ''} from {Object.keys(groupedByFarm).length} farm{Object.keys(groupedByFarm).length !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.values(groupedByFarm).map(group => (
              <div key={group.farm_name} className="bg-white rounded-card p-5 border border-mist">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-mist">
                  <span className="text-lg">🌾</span>
                  <Link to={`/farm/${group.farm_id}`} className="font-display font-semibold text-soil hover:text-moss transition-colors">
                    {group.farm_name}
                  </Link>
                </div>
                <div className="space-y-4">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-mist">
                        {item.image_path ? (
                          <img src={item.image_path} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">{categoryEmoji[item.category]}</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`} className="font-display font-semibold text-soil text-sm hover:text-moss transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-xs font-body text-bark/60 mt-0.5">€{parseFloat(item.price).toFixed(2)} / {item.unit}</p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center rounded-pill border border-mist overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-bark hover:bg-mist transition-colors font-bold"
                        >−</button>
                        <span className="w-8 text-center text-sm font-body font-semibold text-soil">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center text-bark hover:bg-mist transition-colors font-bold disabled:opacity-30"
                        >+</button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right w-20 shrink-0">
                        <p className="font-display font-semibold text-soil text-sm">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-bark/30 hover:text-red-500 transition-colors text-lg leading-none p-1"
                        title="Remove"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-card p-6 border border-mist sticky top-24">
              <h2 className="font-display font-semibold text-soil text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between text-bark/80">
                  <span>Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-bark/80">
                  <span>Delivery estimate</span>
                  <span>€{deliveryEstimate.toFixed(2)}</span>
                </div>
                <div className="border-t border-mist pt-3 flex justify-between font-semibold text-soil text-base">
                  <span>Total</span>
                  <span className="font-display text-xl">€{(total + deliveryEstimate).toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full justify-center mt-6 py-3.5">
                Proceed to Checkout →
              </button>

              <Link to="/market" className="block text-center text-moss text-xs font-body hover:underline mt-4">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
