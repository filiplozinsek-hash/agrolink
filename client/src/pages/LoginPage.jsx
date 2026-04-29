import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { login, user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate(user.role === 'farmer' ? '/dashboard' : from)
    return null
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    try {
      const u = await login(form.email, form.password)
      addToast(`Welcome back, ${u.name.split(' ')[0]}! 👋`)
      navigate(u.role === 'farmer' ? '/dashboard' : from, { replace: true })
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-2xl">🌾</span>
            <span className="font-display font-bold text-2xl text-soil">AgroLink</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-soil mb-2">Welcome back</h1>
          <p className="text-bark/70 font-body text-sm">Sign in to continue to your account</p>
        </div>

        <div className="bg-white rounded-card p-8 shadow-sm border border-mist">
          {errors.form && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600 font-body">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600 font-body">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <LoadingSpinner size="sm" color="white" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-mist">
            <p className="text-xs font-body text-bark/60 text-center mb-3">Test accounts</p>
            <div className="space-y-2 text-xs font-body text-bark/70">
              <div className="flex justify-between bg-mist rounded-lg px-3 py-2">
                <span>🌾 Farmer:</span><span>marko@novakfarm.si / password123</span>
              </div>
              <div className="flex justify-between bg-mist rounded-lg px-3 py-2">
                <span>🛒 Consumer:</span><span>test@consumer.com / password123</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm font-body text-bark/70">
          New to AgroLink?{' '}
          <Link to="/register" className="text-moss font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
