import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['vegetables', 'fruit', 'dairy', 'honey', 'meat', 'other']
const UNITS = ['kg', 'piece', 'jar', 'litre', 'bundle', 'bag', 'box']

export default function AddProductPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { authFetch } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name: '', description: '', category: 'vegetables',
    price: '', unit: 'kg', stock: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    setFetching(true)
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        const p = data.product
        if (!p) return
        setForm({
          name: p.name, description: p.description || '',
          category: p.category, price: p.price, unit: p.unit, stock: p.stock
        })
        if (p.image_path) setExistingImage(p.image_path)
      })
      .catch(() => addToast('Failed to load product', 'error'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = 'Enter a valid price'
    if (form.stock === '' || isNaN(form.stock) || parseInt(form.stock) < 0) e.stock = 'Enter a valid stock quantity'
    if (!form.category) e.category = 'Category is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (image) formData.append('image', image)

    try {
      const res = await authFetch(
        isEdit ? `/api/products/${id}` : '/api/products',
        { method: isEdit ? 'PUT' : 'POST', body: formData }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')
      addToast(isEdit ? 'Product updated 🌿' : 'Product listed successfully 🎉')
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  const f = (key) => ({
    value: form[key],
    onChange: e => { setForm({ ...form, [key]: e.target.value }); setErrors(prev => ({ ...prev, [key]: undefined })) }
  })

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="text-bark/60 hover:text-soil font-body text-sm transition-colors group flex items-center gap-1">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Dashboard
          </Link>
        </div>

        <h1 className="font-display text-3xl font-semibold text-soil mb-8">
          {isEdit ? 'Edit Product' : 'List New Product'}
        </h1>

        <div className="bg-white rounded-card p-8 border border-mist">
          {errors.form && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Image upload */}
            <div>
              <label className="label">Product Image</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-mist rounded-2xl overflow-hidden cursor-pointer hover:border-moss transition-colors duration-250"
              >
                {preview || existingImage ? (
                  <div className="relative aspect-video">
                    <img
                      src={preview || existingImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-soil/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-body text-sm font-medium">Change image</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-bark/40">
                    <span className="text-4xl mb-3">📷</span>
                    <p className="font-body text-sm">Click to upload image</p>
                    <p className="font-body text-xs mt-1">JPEG, PNG, WebP — max 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="label">Product Name</label>
              <input {...f('name')} type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="e.g. Organic Purple Garlic" />
              {errors.name && <p className="mt-1 text-xs text-red-600 font-body">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea {...f('description')} rows={4} className="input-field resize-none" placeholder="Describe your product — flavour profile, growing methods, harvest season..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select {...f('category')} className={`input-field ${errors.category ? 'border-red-400' : ''}`}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Unit</label>
                <select {...f('unit')} className="input-field">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (EUR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bark/60 font-body">€</span>
                  <input
                    {...f('price')}
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={`input-field pl-8 ${errors.price ? 'border-red-400' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-600 font-body">{errors.price}</p>}
              </div>
              <div>
                <label className="label">Stock Quantity</label>
                <input
                  {...f('stock')}
                  type="number"
                  min="0"
                  step="1"
                  className={`input-field ${errors.stock ? 'border-red-400' : ''}`}
                  placeholder="0"
                />
                {errors.stock && <p className="mt-1 text-xs text-red-600 font-body">{errors.stock}</p>}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3.5">
                {loading ? <LoadingSpinner size="sm" color="white" /> : isEdit ? 'Save Changes' : 'List Product'}
              </button>
              <Link to="/dashboard" className="btn-secondary px-6">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
