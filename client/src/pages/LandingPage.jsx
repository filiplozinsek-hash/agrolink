import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FadeUp } from '../hooks/useScrollAnimation'
import ProductCard from '../components/ProductCard'
import FarmerCard from '../components/FarmerCard'
import { SkeletonCard } from '../components/LoadingSpinner'

const stats = [
  { value: '9.1M', label: 'Family farms in Europe', icon: '🌾' },
  { value: '80%', label: 'Revenue goes to the farmer', icon: '💚' },
  { value: '4×', label: 'Better rates than wholesale', icon: '📈' },
  { value: '48h', label: 'Average delivery time', icon: '🚚' },
]

const steps = [
  {
    step: '01',
    icon: '🌱',
    title: 'Farmers list their harvest',
    desc: 'Independent farms across Slovenia and Austria list seasonal products with transparent pricing. No middlemen, no markups.'
  },
  {
    step: '02',
    icon: '🛍️',
    title: 'You browse and order directly',
    desc: 'Filter by category, region, and price. Read the real story behind each farm. Add to cart and checkout in minutes.'
  },
  {
    step: '03',
    icon: '📦',
    title: 'Delivered fresh from the source',
    desc: 'Products leave the farm within 24 hours of your order. No cold storage, no distribution centres — straight to your door.'
  },
]

const categories = [
  { emoji: '🥦', label: 'Vegetables', key: 'vegetables' },
  { emoji: '🍎', label: 'Fruit', key: 'fruit' },
  { emoji: '🍯', label: 'Honey', key: 'honey' },
  { emoji: '🧀', label: 'Dairy', key: 'dairy' },
  { emoji: '🥩', label: 'Meat', key: 'meat' },
  { emoji: '🌿', label: 'Herbs & More', key: 'other' },
]

export default function LandingPage() {
  const [products, setProducts] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=8&sort=newest').then(r => r.json()),
      fetch('/api/farms').then(r => r.json())
    ]).then(([prodData, farmData]) => {
      setProducts(prodData.products || [])
      setFarms(farmData.slice(0, 3))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-off-white">
      {/* Hero */}
      <section className="hero-gradient min-h-[92vh] flex items-center overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-moss/10 rounded-pill border border-moss/20">
              <span className="text-sm font-body font-medium text-moss">🌿 Farm-direct marketplace</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl text-soil leading-[1.1] tracking-tight">
              From Soil
              <br />
              <em className="text-moss">to Soul</em>
            </h1>
            <p className="text-bark/80 text-lg font-body leading-relaxed max-w-md">
              The premium marketplace connecting Slovenia and Austria's finest independent farms
              directly to your table. Seasonal, traceable, and priced fairly for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/market" className="btn-primary text-base px-8 py-4">
                Browse the Market →
              </Link>
              <Link to="/register" className="btn-secondary text-base px-8 py-4">
                🌾 Sell Your Harvest
              </Link>
            </div>
            <p className="text-sm font-body text-bark/50">
              Join 240+ farms already selling on AgroLink
            </p>
          </div>

          {/* Right: category grid */}
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat.key}
                to={`/market?category=${cat.key}`}
                className={`group flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-mist bg-white hover:border-moss hover:shadow-lg hover:-translate-y-1 transition-all duration-250 cursor-pointer ${i === 0 ? 'col-span-1 row-span-1' : ''}`}
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-250">{cat.emoji}</span>
                <span className="text-xs font-medium font-body text-bark group-hover:text-moss transition-colors duration-250 text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-off-white to-transparent pointer-events-none" />
      </section>

      {/* Stats bar */}
      <section className="bg-soil">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display text-3xl font-bold text-hay">{s.value}</div>
                <div className="text-cream/60 text-xs font-body mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-moss font-body font-medium mb-3 tracking-wider uppercase text-sm">How it works</p>
            <h2 className="section-title">Simple, honest, direct</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FadeUp key={step.step} delay={i + 1}>
                <div className="bg-white rounded-card p-8 border border-mist h-full">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-xs font-body font-bold text-moss/60 tracking-widest mb-3">{step.step}</div>
                  <h3 className="font-display font-semibold text-xl text-soil mb-3">{step.title}</h3>
                  <p className="text-bark/70 text-sm font-body leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="flex items-end justify-between mb-10">
            <div>
              <p className="text-moss font-body font-medium mb-2 tracking-wider uppercase text-sm">Meet the growers</p>
              <h2 className="section-title">Featured Farms</h2>
            </div>
            <Link to="/market" className="hidden sm:inline-flex btn-ghost text-sm">
              All farms →
            </Link>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm, i) => (
              <FadeUp key={farm.id} delay={i + 1}>
                <FarmerCard farm={farm} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="flex items-end justify-between mb-10">
            <div>
              <p className="text-moss font-body font-medium mb-2 tracking-wider uppercase text-sm">Fresh picks</p>
              <h2 className="section-title">From the Farm Today</h2>
            </div>
            <Link to="/market" className="hidden sm:inline-flex btn-ghost text-sm">
              View all →
            </Link>
          </FadeUp>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map(product => (
                  <FadeUp key={product.id}>
                    <ProductCard product={product} />
                  </FadeUp>
                ))
            }
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 px-6 bg-mist">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-moss rounded-card p-10 text-white">
                <div className="text-4xl mb-4">🌾</div>
                <h3 className="font-display text-2xl font-semibold mb-3">Sell your harvest</h3>
                <p className="text-white/70 font-body text-sm leading-relaxed mb-6">
                  List your products in minutes. Set your own prices. Keep 80% of every sale.
                  No contracts, no hidden fees.
                </p>
                <Link to="/register" className="inline-flex btn-secondary border-white text-white hover:bg-white hover:text-moss">
                  Start selling →
                </Link>
              </div>
              <div className="bg-white rounded-card p-10 border border-mist">
                <div className="text-4xl mb-4">🛒</div>
                <h3 className="font-display text-2xl font-semibold text-soil mb-3">Buy direct from farms</h3>
                <p className="text-bark/70 font-body text-sm leading-relaxed mb-6">
                  No supermarket markups. Seasonal produce at fair prices. Know exactly where
                  your food comes from and who grew it.
                </p>
                <Link to="/market" className="btn-primary">
                  Shop the market →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
