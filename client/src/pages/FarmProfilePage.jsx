import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import ProductCard from '../components/ProductCard'

export default function FarmProfilePage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/farms/${id}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }
  if (!data?.farm) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-5xl mb-4">🌾</div>
      <h2 className="font-display text-2xl text-soil mb-2">Farm not found</h2>
      <Link to="/market" className="btn-primary mt-4">Back to Market</Link>
    </div>
  )

  const { farm, products, stats } = data

  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-moss/10 to-sage/5 border-b border-mist">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <Link to="/market" className="inline-flex items-center gap-2 text-bark/60 hover:text-soil text-sm font-body mb-8 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Market
          </Link>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-moss to-sage flex items-center justify-center text-white font-display font-bold text-4xl shrink-0">
              {farm.farmer_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-soil">{farm.farm_name}</h1>
                <span className="badge bg-moss/10 text-moss border border-moss/20">✓ Verified Farm</span>
              </div>
              <p className="text-bark/70 font-body text-sm mb-1">
                🧑‍🌾 {farm.farmer_name} &nbsp;·&nbsp; 📍 {farm.location}
                {farm.founded_year && <>&nbsp;·&nbsp; 🌱 Farming since {farm.founded_year}</>}
              </p>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="font-display font-bold text-2xl text-soil">{stats.totalProducts}</div>
                  <div className="text-xs font-body text-bark/60">Total products</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-2xl text-soil">{stats.inStock}</div>
                  <div className="text-xs font-body text-bark/60">In stock</div>
                </div>
              </div>
            </div>
          </div>

          {farm.bio && (
            <div className="mt-8 max-w-2xl">
              <p className="text-bark/80 font-body leading-relaxed">{farm.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-display text-2xl font-semibold text-soil mb-8">
          {products.length > 0 ? `Available from ${farm.farm_name}` : 'No products listed yet'}
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={{ ...p, farm_name: farm.farm_name, farm_id: farm.id }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-bark/60 font-body">This farm is setting up — check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
