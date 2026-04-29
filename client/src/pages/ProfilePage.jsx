import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const statusColors = {
  pending: 'bg-hay/20 text-bark',
  confirmed: 'bg-sage/20 text-moss',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-moss/10 text-moss',
  cancelled: 'bg-red-50 text-red-600'
}

export default function ProfilePage() {
  const { user, authFetch } = useAuth()
  const { addToast } = useToast()

  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', city: '', postalCode: '', country: 'Slovenia' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, ordersRes] = await Promise.all([
          authFetch('/api/auth/me'),
          authFetch('/api/orders')
        ])
        const [profileData, ordersData] = await Promise.all([profileRes.json(), ordersRes.json()])
        setProfile(profileData)
        setOrders(Array.isArray(ordersData) ? ordersData : [])

        const addr = profileData.delivery_address || {}
        setForm({
          name: profileData.name || '',
          address: addr.address || '',
          city: addr.city || '',
          postalCode: addr.postalCode || '',
          country: addr.country || 'Slovenia'
        })
      } catch {
        addToast('Failed to load profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setErrors({ name: 'Name is required' }); return }
    setSaving(true)
    setErrors({})
    try {
      const res = await authFetch('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          deliveryAddress: {
            name: form.name,
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country
          }
        })
      })
      const updated = await res.json()
      setProfile(prev => ({ ...prev, ...updated }))
      addToast('Profile updated 👤')
      setEditing(false)
    } catch {
      addToast('Failed to save changes', 'error')
    } finally {
      setSaving(false)
    }
  }

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value })
  })

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl md:text-4xl text-soil mb-10">My Profile</h1>

        {/* Profile card */}
        <div className="bg-white rounded-card p-8 border border-mist mb-8">
          {!editing ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-moss to-sage flex items-center justify-center text-white font-display font-bold text-2xl">
                    {profile?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-xl text-soil">{profile?.name}</h2>
                    <p className="text-bark/60 font-body text-sm">{profile?.email}</p>
                    <span className={`badge mt-1 ${profile?.role === 'farmer' ? 'bg-moss/10 text-moss' : 'bg-hay/20 text-bark'}`}>
                      {profile?.role === 'farmer' ? '🌾 Farmer' : '🛒 Shopper'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setEditing(true)} className="btn-ghost text-sm">
                  ✏️ Edit
                </button>
              </div>

              {profile?.delivery_address && (
                <div className="border-t border-mist pt-5">
                  <p className="text-xs font-body text-bark/50 mb-2">Delivery address</p>
                  <p className="font-body text-sm text-soil">
                    {profile.delivery_address.address && `${profile.delivery_address.address}, `}
                    {profile.delivery_address.city && `${profile.delivery_address.city} `}
                    {profile.delivery_address.postalCode && `${profile.delivery_address.postalCode}, `}
                    {profile.delivery_address.country}
                  </p>
                </div>
              )}

              <div className="border-t border-mist pt-5 mt-5">
                <p className="text-xs font-body text-bark/50">
                  Member since {new Date(profile?.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <h3 className="font-display font-semibold text-soil mb-4">Edit Profile</h3>
              <div>
                <label className="label">Full name</label>
                <input {...f('name')} type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="mt-1 text-xs text-red-600 font-body">{errors.name}</p>}
              </div>
              <p className="text-xs font-body text-bark/50 pt-2">Delivery Address</p>
              <div>
                <label className="label">Street address</label>
                <input {...f('address')} type="text" className="input-field" placeholder="Slovenska cesta 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input {...f('city')} type="text" className="input-field" placeholder="Ljubljana" />
                </div>
                <div>
                  <label className="label">Postal code</label>
                  <input {...f('postalCode')} type="text" className="input-field" placeholder="1000" />
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
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Order history */}
        {user?.role === 'consumer' && (
          <div>
            <h2 className="font-display text-2xl text-soil mb-5">Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-card p-12 border border-mist text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-bark/60 font-body text-sm">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-card p-5 border border-mist">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-display font-semibold text-soil">Order #{String(order.id).padStart(5, '0')}</p>
                        <p className="text-xs font-body text-bark/50 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${statusColors[order.status] || 'bg-mist text-bark'}`}>
                          {order.status}
                        </span>
                        <p className="font-display font-bold text-soil mt-1">€{parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                    {Array.isArray(order.items) && (
                      <div className="border-t border-mist pt-3 space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs font-body text-bark/70">
                            <span>{item.product_name} <span className="text-bark/40">×{item.quantity}</span></span>
                            <span>€{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
