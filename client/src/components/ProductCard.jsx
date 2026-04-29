import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const categoryEmoji = {
  vegetables: '🥦',
  dairy: '🧀',
  honey: '🍯',
  meat: '🥩',
  fruit: '🍎',
  other: '🌿'
}

const categoryColors = {
  vegetables: 'from-sage/20 to-moss/10',
  dairy: 'from-hay/20 to-cream',
  honey: 'from-hay/30 to-hay/10',
  meat: 'from-red-100 to-red-50',
  fruit: 'from-orange-100 to-yellow-50',
  other: 'from-sage/10 to-cream'
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { addToast } = useToast()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
    addToast(`${product.name} added to cart 🛍️`)
  }

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="card overflow-hidden cursor-pointer">
        {/* Image */}
        <div className="aspect-square relative overflow-hidden">
          {product.image_path ? (
            <img
              src={product.image_path}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${categoryColors[product.category] || 'from-mist to-cream'}`}>
              <span className="text-5xl">{categoryEmoji[product.category]}</span>
            </div>
          )}
          {/* Stock badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-soil/40 flex items-center justify-center">
              <span className="badge bg-soil/80 text-cream">Out of stock</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-3 left-3">
              <span className="badge bg-hay text-soil">Only {product.stock} left</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs font-body text-sage font-medium mb-1">{product.farm_name}</p>
          <h3 className="font-display font-semibold text-soil text-base leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-end justify-between mt-3">
            <div>
              <span className="font-display font-bold text-xl text-soil">
                €{parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-bark/70 font-body ml-1">/ {product.unit}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-250 ${
                product.stock === 0
                  ? 'bg-mist text-bark/40 cursor-not-allowed'
                  : 'bg-moss text-white hover:bg-bark hover:scale-110 active:scale-95'
              }`}
              title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
