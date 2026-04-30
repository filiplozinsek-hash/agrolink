import { Link } from 'react-router-dom'

export default function FarmerCard({ farm }) {
  // Placeholder card — shown when no real farmer data exists yet
  if (farm.placeholder) {
    return (
      <div className="card overflow-hidden h-full flex flex-col">
        <div className="relative h-40 overflow-hidden">
          <img
            src={farm.image}
            alt="Available farm spot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-soil/50 flex items-center justify-center">
            <span className="badge bg-hay text-soil text-xs font-semibold tracking-wide">
              🌾 Spot Available
            </span>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1 items-center justify-center text-center">
          <p className="text-bark/60 font-body text-sm leading-relaxed mb-5">
            This spot is available for a local farmer. List your harvest and reach customers directly.
          </p>
          <Link
            to="/register"
            className="btn-primary text-sm px-6 py-2.5"
          >
            Join Now →
          </Link>
        </div>
      </div>
    )
  }

  // Real farmer card
  return (
    <Link to={`/farm/${farm.id}`} className="group block h-full">
      <div className="card overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Farm photo header */}
        {farm.image ? (
          <div className="relative h-40 overflow-hidden">
            <img
              src={farm.image}
              alt={farm.farm_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-soil/60 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <span className="text-white font-display font-semibold text-sm">{farm.farm_name}</span>
            </div>
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-moss/20 to-sage/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-moss to-sage flex items-center justify-center text-white font-display font-bold text-2xl">
              {farm.farmer_name?.[0]?.toUpperCase()}
            </div>
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {!farm.image && (
            <h3 className="font-display font-semibold text-soil text-lg leading-snug group-hover:text-moss transition-colors duration-250 mb-1">
              {farm.farm_name}
            </h3>
          )}
          <p className="text-sage text-xs font-body mb-2">by {farm.farmer_name}</p>

          <div className="flex items-center gap-1.5 text-bark/70 text-xs font-body mb-3">
            <span>📍</span>
            <span>{farm.location}</span>
          </div>

          {farm.bio && (
            <p className="text-soil/70 text-sm font-body leading-relaxed line-clamp-3 mb-4 flex-1">
              {farm.bio}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-mist mt-auto">
            <span className="text-xs font-body text-bark/60">
              {farm.product_count > 0 ? `${farm.product_count} product${farm.product_count !== 1 ? 's' : ''}` : 'New farmer'}
            </span>
            {farm.founded_year && (
              <span className="text-xs font-body text-bark/60">Since {farm.founded_year}</span>
            )}
          </div>

          <span className="inline-flex items-center text-moss text-sm font-medium font-body gap-1 mt-3 group-hover:gap-2 transition-all duration-250">
            View farm <span className="group-hover:translate-x-1 transition-transform duration-250">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
