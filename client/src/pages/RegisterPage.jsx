import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [role, setRole] = useState('consumer')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    farmName: '', location: '', bio: '', foundedYear: '',
    deliveryName: '', deliveryAddress: '', deliveryCity: '', deliveryPostal: '', deliveryCountry: 'Slovenia'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate(user.role === 'farmer' ? '/dashboard' : '/')
    return null
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })
  const err = (key) => errors[key] ? <p className="mt-1 text-xs text-red-600 font-body">{errors[key]}</p> : null

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (role === 'farmer') {
      if (!form.farmName.trim()) e.farmName = 'Farm name is required'
      if (!form.location.trim()) e.location = 'Location is required'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password, role,
        ...(role === 'farmer' ? {
          farmName: form.farmName, location: form.location,
          bio: form.bio, foundedYear: form.foundedYear ? parseInt(form.foundedYear) : null
        } : {
          deliveryAddress: {
            name: form.deliveryName || form.name,
            address: form.deliveryAddress,
            city: form.deliveryCity,
            postalCode: form.deliveryPostal,
            country: form.deliveryCountry
          }
        })
      }
      const u = await register(payload)
      addToast(`Welcome to AgroLink, ${u.name.split(' ')[0]}! 🎉`)
      navigate(u.role === 'farmer' ? '/dashboard' : '/')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-2xl">🌾</span>
            <span className="font-display font-bold text-2xl text-soil">AgroLink</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-soil mb-2">Create your account</h1>
          <p className="text-bark/70 font-body text-sm">Join the farm-direct marketplace</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { val: 'consumer', icon: '🛒', title: "I'm a Shopper", desc: 'Buy direct from farms' },
            { val: 'farmer', icon: '🌾', title: "I'm a Farmer", desc: 'Sell your harvest' },
          ].map(r => (
            <button
              key={r.val}
              type="button"
              onClick={() => setRole(r.val)}
              className={`p-5 rounded-card border-2 text-left transition-all duration-250 ${
                role === r.val
                  ? 'border-moss bg-moss/5 shadow-sm'
                  : 'border-mist bg-white hover:border-sage'
              }`}
            >
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className={`font-display font-semibold text-sm ${role === r.val ? 'text-moss' : 'text-soil'}`}>{r.title}</div>
              <div className="text-xs font-body text-bark/60 mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-card p-8 shadow-sm border border-mist">
          {errors.form && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="label">Full name</label>
              <input {...f('name')} type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="Your full name" />
              {err('name')}
            </div>

            <div>
              <label className="label">Email address</label>
              <input {...f('email')} type="email" className={`input-field ${errors.email ? 'border-red-400' : ''}`} placeholder="you@example.com" />
              {err('email')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input {...f('password')} type="password" className={`input-field ${errors.password ? 'border-red-400' : ''}`} placeholder="Min. 8 characters" />
                {err('password')}
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input {...f('confirmPassword')} type="password" className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`} placeholder="Repeat password" />
                {err('confirmPassword')}
              </div>
            </div>

            {role === 'farmer' && (
              <>
                <div className="pt-4 border-t border-mist">
                  <p className="text-sm font-display font-semibold text-soil mb-4">🌾 Your Farm Details</p>
                </div>
                <div>
                  <label className="label">Farm name</label>
                  <input {...f('farmName')} type="text" className={`input-field ${errors.farmName ? 'border-red-400' : ''}`} placeholder="e.g. Novak Family Farm" />
                  {err('farmName')}
                </div>
                <div>
                  <label className="label">Location / Region</label>
                  <input {...f('location')} type="text" className={`input-field ${errors.location ? 'border-red-400' : ''}`} placeholder="e.g. Pomurje, Slovenia" />
                  {err('location')}
                </div>
                <div>
                  <label className="label">Farm bio <span className="text-bark/40 font-normal">(optional)</span></label>
                  <textarea {...f('bio')} rows={3} className="input-field resize-none" placeholder="Tell customers about your farm and practices..." />
                </div>
                <div>
                  <label className="label">Farming since <span className="text-bark/40 font-normal">(optional)</span></label>
                  <input {...f('foundedYear')} type="number" min="1900" max={new Date().getFullYear()} className="input-field" placeholder="e.g. 2005" />
                </div>
              </>
            )}

            {role === 'consumer' && (
              <>
                <div className="pt-4 border-t border-mist">
                  <p className="text-sm font-display font-semibold text-soil mb-4">📦 Delivery Address <span className="text-bark/40 font-normal font-body">(optional)</span></p>
                </div>
                <div>
                  <label className="label">Street address</label>
                  <input {...f('deliveryAddress')} type="text" className="input-field" placeholder="Slovenska cesta 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input {...f('deliveryCity')} type="text" className="input-field" placeholder="Ljubljana" />
                  </div>
                  <div>
                    <label className="label">Postal code</label>
                    <input {...f('deliveryPostal')} type="text" className="input-field" placeholder="1000" />
                  </div>
                </div>
                <div>
                  <label className="label">Country</label>
                  <select {...f('deliveryCountry')} className="input-field">
                    <option>Slovenia</option>
                    <option>Austria</option>
                    <option>Croatia</option>
                    <option>Italy</option>
                    <option>Germany</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2">
              {loading ? <LoadingSpinner size="sm" color="white" /> : `Create ${role === 'farmer' ? 'Farmer' : 'Shopper'} Account`}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm font-body text-bark/70">
          Already have an account?{' '}
          <Link to="/login" className="text-moss font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
