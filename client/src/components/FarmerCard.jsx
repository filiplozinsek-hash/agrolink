import { Link } from 'react-router-dom'

export default function FarmerCard({ farm }) {
  return (
    <Link to={`/farm/${farm.id}`} className="group block">
      <div className="card p-6 cursor-pointer h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-moss to-sage flex items-center justify-center text-white font-display font-bold text-xl shrink-0">
            {farm.farmer_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-soil text-lg leading-snug group-hover:text-moss transition-colors duration-250">
              {farm.farm_name}
            </h3>
            <p className="text-sage text-sm font-body mt-0.5">by {farm.farmer_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-bark/70 text-sm font-body mb-3">
          <span>📍</span>
          <span>{farm.location}</span>
        </div>

        {farm.bio && (
          <p className="text-soil/70 text-sm font-body leading-relaxed line-clamp-3 mb-4">
            {farm.bio}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-mist">
          <span className="text-xs font-body text-bark/60">
            {farm.product_count > 0 ? `${farm.product_count} product${farm.product_count !== 1 ? 's' : ''}` : 'New farmer'}
          </span>
          {farm.founded_year && (
            <span className="text-xs font-body text-bark/60">
              Since {farm.founded_year}
            </span>
          )}
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center text-moss text-sm font-medium font-body group-hover:gap-2 gap-1 transition-all duration-250">
            View farm <span className="group-hover:translate-x-1 transition-transform duration-250">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
