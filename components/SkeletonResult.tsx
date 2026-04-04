'use client'

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl ${className || ''}`}
      style={{
        background: 'linear-gradient(90deg, var(--surface2) 25%, #252533 50%, var(--surface2) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export default function SkeletonResult() {
  return (
    <div className="space-y-4 p-4 max-w-lg mx-auto animate-fadeUp">
      {/* Product header skeleton */}
      <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Shimmer style={{ width: 80, height: 80, borderRadius: 16, flexShrink: 0 }} />
        <div className="flex-1 space-y-2">
          <Shimmer style={{ height: 20, width: '75%' }} />
          <Shimmer style={{ height: 14, width: '40%' }} />
          <div className="flex gap-2 mt-2">
            <Shimmer style={{ height: 22, width: 90, borderRadius: 99 }} />
            <Shimmer style={{ height: 22, width: 70, borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Emotional indicator skeleton */}
      <div className="flex flex-col items-center py-5 rounded-2xl" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Shimmer style={{ width: 64, height: 64, borderRadius: 32 }} />
        <Shimmer style={{ height: 24, width: 80, marginTop: 8 }} />
      </div>

      {/* Score cards skeleton */}
      <div className="flex gap-3">
        <div className="flex-1 p-5 rounded-2xl" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shimmer style={{ height: 12, width: '65%', marginBottom: 12 }} />
          <Shimmer style={{ height: 42, width: '55%' }} />
          <Shimmer style={{ height: 24, width: 70, borderRadius: 99, marginTop: 12 }} />
        </div>
        <div className="flex-1 p-5 rounded-2xl" style={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shimmer style={{ height: 12, width: '65%', marginBottom: 12 }} />
          <Shimmer style={{ height: 42, width: '55%' }} />
          <Shimmer style={{ height: 24, width: 70, borderRadius: 99, marginTop: 12 }} />
        </div>
      </div>

      {/* Data source skeleton */}
      <Shimmer style={{ height: 40, borderRadius: 12 }} />

      {/* Nutri-Score skeleton */}
      <div className="flex gap-1.5">
        {[1,2,3,4,5].map(i => (
          <Shimmer key={i} className="flex-1" style={{ height: 36, borderRadius: 8 }} />
        ))}
      </div>

      {/* Tab skeletons */}
      <div className="flex gap-2">
        <Shimmer style={{ height: 38, flex: 1, borderRadius: 8 }} />
        <Shimmer style={{ height: 38, flex: 1, borderRadius: 8 }} />
        <Shimmer style={{ height: 38, flex: 1, borderRadius: 8 }} />
      </div>

      {/* Content area skeleton - varying widths */}
      <div className="space-y-2">
        <Shimmer style={{ height: 44, borderRadius: 12, width: '100%' }} />
        <Shimmer style={{ height: 44, borderRadius: 12, width: '90%' }} />
        <Shimmer style={{ height: 44, borderRadius: 12, width: '95%' }} />
        <Shimmer style={{ height: 44, borderRadius: 12, width: '80%' }} />
      </div>
    </div>
  )
}
