import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-soil text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌾</span>
              <span className="font-display font-bold text-2xl text-hay">AgroLink</span>
            </div>
            <p className="text-cream/70 text-sm font-body leading-relaxed max-w-xs">
              Connecting Europe's finest small farms directly with conscious consumers.
              Every purchase supports an independent farmer and reduces the supply chain.
            </p>
            <p className="text-cream/50 text-xs font-body mt-6">
              © {new Date().getFullYear()} AgroLink. Made with care.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-hay mb-4">Marketplace</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/market', label: 'Browse Products' },
                { to: '/market?category=vegetables', label: 'Vegetables' },
                { to: '/market?category=honey', label: 'Honey & Preserves' },
                { to: '/market?category=fruit', label: 'Seasonal Fruit' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-cream/70 text-sm font-body hover:text-hay transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-hay mb-4">For Farmers</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/register', label: 'Join as Farmer' },
                { to: '/dashboard', label: 'Farmer Dashboard' },
                { to: '/login', label: 'Sign In' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-cream/70 text-sm font-body hover:text-hay transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
