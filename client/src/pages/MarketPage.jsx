import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/LoadingSpinner'

const CATEGORIES = [
  { value: 'all', label: 'All Products', emoji: '✨' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { value: 'fruit', label: 'Fruit', emoji: '🍎' },
  { value: 'honey', label: 'Honey', emoji: '🍯' },
  { value: 'dairy', label: 'Dairy', emoji: '🧀' },
  { value: 'meat', label: 'Meat', emoji: '🥩' },
  { value: 'other', label: 'Herbs & More', emoji: '🌿' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export default function MarketPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const inStock = searchParams.get('inStock') === 'true'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [searchInput, setSearchInput] = useState(search)
  const [priceRange, setPriceRange] = useState([minPrice || 0, maxPrice || 100])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === null || value === undefined) next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setSearchParams(next)
  }

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (sort) params.set('sort', sort)
    if (search) params.set('search', search)
    if (inStock) params.set('inStock', 'true')
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('page', page)
    params.set('limit', 12)

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, sort, search, inStock, minPrice, maxPrice, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('search', searchInput)
  }

  const handlePriceApply = () => {
    const next = new URLSearchParams(searchParams)
    if (priceRange[0] > 0) next.set('minPrice', priceRange[0])
    else next.delete('minPrice')
    if (priceRange[1] < 100) next.set('maxPrice', priceRange[1])
    else next.delete('maxPrice')
    next.delete('page')
    setSearchParams(next)
  }

  const clearAll = () => {
    setSearchInput('')
    setPriceRange([0, 100])
    setSearchParams({})
  }

  const hasFilters = category !== 'all' || search || inStock || minPrice || maxPrice

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-cream border-b border-mist">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-soil mb-1">The Market</h1>
              <p className="text-bark/60 font-body text-sm">
                {loading ? '...' : `${total} product${total !== 1 ? 's' : ''} from local farms`}
              </p>
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="input-field max-w-xs text-sm"
              />
              <button type="submit" className="btn-primary text-sm px-5 py-2.5">
                🔍
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar toggle mobile */}
        <button
          className="lg:hidden fixed bottom-6 left-6 z-30 btn-primary shadow-xl"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          🔧 Filters {hasFilters && '•'}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white lg:bg-transparent
          lg:block overflow-y-auto lg:overflow-visible
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-60 xl:w-64 shrink-0 shadow-2xl lg:shadow-none p-6 lg:p-0
        `}>
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-display font-semibold text-soil mb-3">Category</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => { setParam('category', cat.value === 'all' ? null : cat.value); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
                      category === cat.value
                        ? 'bg-moss text-white'
                        : 'text-bark hover:bg-mist'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <h3 className="font-display font-semibold text-soil mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-body text-bark/70">
                  <span>€{priceRange[0]}</span>
                  <span>€{priceRange[1]}</span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <button onClick={handlePriceApply} className="btn-ghost text-xs w-full">
                  Apply price filter
                </button>
              </div>
            </div>

            {/* In stock toggle */}
            <div>
              <h3 className="font-display font-semibold text-soil mb-3">Availability</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setParam('inStock', inStock ? null : 'true')}
                  className={`w-11 h-6 rounded-full transition-colors duration-250 relative ${inStock ? 'bg-moss' : 'bg-mist'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-250 ${inStock ? 'left-[22px]' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-body text-bark group-hover:text-soil transition-colors">In stock only</span>
              </label>
            </div>

            {/* Clear all */}
            {hasFilters && (
              <button onClick={clearAll} className="text-red-500 text-xs font-body hover:text-red-700 transition-colors">
                ✕ Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-soil/40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort + active filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <select
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
              className="input-field w-auto text-sm py-2"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {hasFilters && (
              <button onClick={clearAll} className="badge bg-mist text-bark hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer">
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🌾</div>
              <h3 className="font-display text-2xl text-soil mb-2">No products found</h3>
              <p className="text-bark/60 font-body text-sm mb-6">Try adjusting your filters or search query.</p>
              <button onClick={clearAll} className="btn-primary">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam('page', page - 1)}
                    className={`px-4 py-2 rounded-xl text-sm font-body transition-all ${page <= 1 ? 'text-bark/30 cursor-not-allowed' : 'hover:bg-mist text-bark'}`}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setParam('page', p)}
                      className={`w-9 h-9 rounded-xl text-sm font-body transition-all ${page === p ? 'bg-moss text-white' : 'hover:bg-mist text-bark'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setParam('page', page + 1)}
                    className={`px-4 py-2 rounded-xl text-sm font-body transition-all ${page >= totalPages ? 'text-bark/30 cursor-not-allowed' : 'hover:bg-mist text-bark'}`}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
