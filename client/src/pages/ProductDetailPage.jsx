import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductCard from '../components/ProductCard'

const categoryEmoji = {
  vegetables: '🥦', dairy: '🧀', honey: '🍯', meat: '🥩', fruit: '🍎', other: '🌿'
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => navigate('/market'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAddToCart = () => {
    if (!data?.product) return
    setAdding(true)
    addItem(data.product, quantity)
    addToast(`${data.product.name} added to cart 🛍️`)
    setTimeout(() => setAdding(false), 600)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data?.product) return null

  const { product, related } = data

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-bark/70 hover:text-soil font-body text-sm mb-8 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-250">←</span>
          Back to Market
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="aspect-square rounded-card overflow-hidden bg-mist">
            {product.image_path ? (
              <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mist to-cream">
                <span className="text-8xl">{categoryEmoji[product.category]}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-mist text-bark">{categoryEmoji[product.category]} {product.category}</span>
              {product.stock === 0 && <span className="badge bg-red-100 text-red-700">Out of stock</span>}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="badge bg-hay/30 text-bark">Only {product.stock} left</span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-semibold text-soil leading-tight mb-2">
              {product.name}
            </h1>

            <Link to={`/farm/${product.farm_id}`} className="flex items-center gap-2 text-moss hover:text-bark text-sm font-body font-medium mb-6 transition-colors group">
              <span className="group-hover:scale-110 transition-transform">🌾</span>
              {product.farm_name}
              <span className="text-bark/40 font-normal">· {product.farm_location}</span>
            </Link>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-4xl font-bold text-soil">
                €{parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-bark/60 font-body">/ {product.unit}</span>
            </div>

            <p className="text-bark/80 font-body text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity + Add to cart */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-pill border-2 border-mist overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-bark hover:bg-mist transition-colors font-body font-bold text-lg"
                  >−</button>
                  <span className="w-10 text-center font-body font-semibold text-soil">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-bark hover:bg-mist transition-colors font-body font-bold text-lg"
                  >+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn-primary flex-1 justify-center"
                >
                  {adding ? '✓ Added!' : '🛍️ Add to Cart'}
                </button>
              </div>
            ) : (
              <div className="py-3 px-6 bg-mist rounded-pill text-bark/60 font-body text-sm text-center">
                Currently out of stock
              </div>
            )}

            {/* Farm mini-card */}
            <div className="mt-8 p-5 bg-cream rounded-2xl border border-mist">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-moss to-sage flex items-center justify-center text-white font-display font-bold shrink-0">
                  {product.farmer_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-soil">{product.farm_name}</div>
                  <div className="text-xs font-body text-bark/60 mb-2">📍 {product.farm_location}{product.founded_year ? ` · Since ${product.founded_year}` : ''}</div>
                  {product.farm_bio && (
                    <p className="text-xs font-body text-bark/70 leading-relaxed line-clamp-2">{product.farm_bio}</p>
                  )}
                  <Link to={`/farm/${product.farm_id}`} className="inline-flex items-center gap-1 text-moss text-xs font-medium font-body mt-2 hover:underline">
                    View full farm profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related?.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-soil mb-6">
              More from {product.farm_name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
