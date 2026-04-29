import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/market', label: '🛒 Market' },
  ]

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'nav-blur shadow-sm' : 'bg-off-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🌾</span>
            <span className="font-display font-bold text-xl text-soil group-hover:text-moss transition-colors duration-250">
              AgroLink
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-pill text-sm font-medium font-body transition-all duration-250 ${
                  location.pathname === link.to
                    ? 'bg-mist text-soil'
                    : 'text-bark hover:bg-mist hover:text-soil'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-pill hover:bg-mist transition-colors duration-250 group">
              <span className="text-xl">🛍️</span>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-moss text-white text-xs font-bold rounded-full flex items-center justify-center font-body">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-pill hover:bg-mist transition-colors duration-250"
                >
                  <div className="w-8 h-8 rounded-full bg-moss flex items-center justify-center text-white font-body font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium font-body text-soil">{user.name?.split(' ')[0]}</span>
                  <span className="text-xs text-bark">▾</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-mist py-2 z-50">
                    {user.role === 'farmer' && (
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-soil hover:bg-mist transition-colors duration-150">
                        <span>🌱</span> Farmer Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-soil hover:bg-mist transition-colors duration-150">
                      <span>👤</span> My Profile
                    </Link>
                    <div className="my-1 border-t border-mist" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <span>↩</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">
                  Join AgroLink
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-pill hover:bg-mist transition-colors">
              <span className="text-xl">🛍️</span>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-moss text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl hover:bg-mist transition-colors"
              aria-label="Toggle menu"
            >
              <div className={`w-5 h-0.5 bg-soil transition-all duration-250 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-5 h-0.5 bg-soil my-1 transition-all duration-250 ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-soil transition-all duration-250 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden nav-blur border-t border-mist px-4 py-4 space-y-2">
          <Link to="/market" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-mist font-body text-soil transition-colors">
            🛒 Market
          </Link>
          {user ? (
            <>
              {user.role === 'farmer' && (
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-mist font-body text-soil transition-colors">
                  🌱 Dashboard
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-mist font-body text-soil transition-colors">
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 font-body text-red-600 transition-colors"
              >
                ↩ Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-sm text-center">Sign In</Link>
              <Link to="/register" className="btn-primary flex-1 text-sm text-center">Join</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
