export default function LoadingSpinner({ size = 'md', color = 'moss' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors = { moss: 'border-moss', hay: 'border-hay', white: 'border-white' }

  return (
    <div className={`${sizes[size]} rounded-full border-2 border-mist ${colors[color]} border-t-transparent animate-spin`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-mist" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-mist rounded-full w-3/4" />
        <div className="h-3 bg-mist rounded-full w-1/2" />
        <div className="h-6 bg-mist rounded-full w-1/3 mt-3" />
      </div>
    </div>
  )
}
