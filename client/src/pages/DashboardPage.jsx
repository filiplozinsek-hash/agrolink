import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const categoryEmoji = {
  vegetables: '🥦', dairy: '🧀', honey: '🍯', meat: '🥩', fruit: '🍎', other: '🌿'
}

const statusColors = {
  pending: 'bg-hay/20 text-bark border-hay/30',
  confirmed: 'bg-sage/20 text-moss border-sage/30',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-moss/10 text-moss border-moss/20',
  cancelled: 'bg-red-50 text-red-600 border-red-200'
}

const statusFlow = ['pending', 'confirmed', 'shipped', 'delivered']

export default function DashboardPage() {
  const { user, authFetch } = useAuth()
  const { addToast } = useToast()

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [prodRes, ordRes] = await Promise.all([
        authFetch(`/api/products?farmId=${user.farmId}&limit=100`),
        authFetch('/api/orders')
      ])
      const [prodData, ordData] = await Promise.all([prodRes.json(), ordRes.json()])
      setProducts(prodData.products || [])
      setOrders(Array.isArray(ordData) ? ordData : [])
    } catch (err) {
      addToast('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user.farmId])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setProducts(prev => prev.filter(p => p.id !== id))
      addToast(`"${name}" deleted`)
    } catch {
      addToast('Failed to delete product', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    try {
      const res = await authFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      addToast(`Order #${String(orderId).padStart(4, '0')} → ${newStatus}`)
    } catch {
      addToast('Failed to update order status', 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-soil to-bark text-cream">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-cream/60 font-body text-sm mb-1">Farmer Dashboard</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">
            Welcome back, {user.name?.split(' ')[0]} 🌾
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: products.length, icon: '📦' },
            { label: 'Total Orders', value: orders.length, icon: '🛒' },
            { label: 'Total Revenue', value: `€${totalRevenue.toFixed(2)}`, icon: '💶' },
            { label: 'Pending Orders', value: pendingOrders, icon: '⏳', highlight: pendingOrders > 0 },
          ].map(stat => (
            <div key={stat.label} className={`rounded-card p-5 border ${stat.highlight ? 'bg-hay/10 border-hay/30' : 'bg-white border-mist'}`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`font-display text-2xl font-bold ${stat.highlight ? 'text-bark' : 'text-soil'}`}>{stat.value}</div>
              <div className="text-xs font-body text-bark/60 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-soil">My Products</h2>
            <Link to="/dashboard/add-product" className="btn-primary text-sm">
              + Add Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-card p-12 border border-mist text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-display text-xl text-soil mb-2">No products yet</h3>
              <p className="text-bark/60 font-body text-sm mb-6">List your first product to start selling.</p>
              <Link to="/dashboard/add-product" className="btn-primary">Add Your First Product</Link>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-mist overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-mist bg-mist/40">
                      <th className="text-left px-5 py-3 text-bark/60 font-medium">Product</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Category</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Price</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Stock</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-mist last:border-0 hover:bg-mist/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center overflow-hidden shrink-0">
                              {product.image_path
                                ? <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
                                : <span className="text-lg">{categoryEmoji[product.category]}</span>
                              }
                            </div>
                            <span className="font-medium text-soil line-clamp-1">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-bark/70 capitalize">{product.category}</td>
                        <td className="px-4 py-4 font-semibold text-soil">€{parseFloat(product.price).toFixed(2)}/{product.unit}</td>
                        <td className="px-4 py-4">
                          <span className={`font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-hay' : 'text-moss'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`badge border ${product.stock > 0 ? 'bg-moss/10 text-moss border-moss/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {product.stock > 0 ? '● Active' : '○ Out of stock'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/dashboard/edit-product/${product.id}`}
                              className="text-xs font-medium text-moss hover:text-bark transition-colors px-3 py-1.5 bg-moss/10 rounded-pill hover:bg-mist"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deletingId === product.id}
                              className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 bg-red-50 rounded-pill hover:bg-red-100"
                            >
                              {deletingId === product.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Orders */}
        <div>
          <h2 className="font-display text-2xl text-soil mb-5">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-card p-12 border border-mist text-center">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-bark/60 font-body text-sm">No orders yet. Once customers order, they'll appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-mist overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-mist bg-mist/40">
                      <th className="text-left px-5 py-3 text-bark/60 font-medium">Order</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Customer</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Items</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Total</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-bark/60 font-medium">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const currentIdx = statusFlow.indexOf(order.status)
                      const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1
                        ? statusFlow[currentIdx + 1] : null
                      return (
                        <tr key={order.id} className="border-b border-mist last:border-0 hover:bg-mist/20 transition-colors">
                          <td className="px-5 py-4 font-semibold text-soil">#{String(order.id).padStart(4, '0')}</td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-soil">{order.consumer_name}</div>
                            <div className="text-bark/50 text-xs">{order.consumer_email}</div>
                          </td>
                          <td className="px-4 py-4 text-bark/70 max-w-[200px]">
                            <div className="line-clamp-2">
                              {Array.isArray(order.items)
                                ? order.items.map(i => `${i.product_name} ×${i.quantity}`).join(', ')
                                : '—'
                              }
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-soil">€{parseFloat(order.total_amount).toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <span className={`badge border text-xs ${statusColors[order.status] || 'bg-mist text-bark border-mist'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {nextStatus && order.status !== 'cancelled' ? (
                              <button
                                onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                disabled={updatingOrderId === order.id}
                                className="text-xs font-medium text-moss hover:text-bark transition-colors px-3 py-1.5 bg-moss/10 rounded-pill hover:bg-mist whitespace-nowrap"
                              >
                                {updatingOrderId === order.id ? '...' : `→ ${nextStatus}`}
                              </button>
                            ) : (
                              <span className="text-bark/30 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
