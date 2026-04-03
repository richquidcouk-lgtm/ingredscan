'use client'

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className || ''}`}
      style={{ backgroundColor: '#1c1c26', ...style }}
    />
  )
}

export default function SkeletonResult() {
  return (
    <div className="space-y-4 p-4 max-w-lg mx-auto animate-fadeUp">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#13131a' }}>
        <Shimmer style={{ width: 80, height: 80, borderRadius: 16 }} />
        <div className="flex-1 space-y-2">
          <Shimmer style={{ height: 20, width: '70%' }} />
          <Shimmer style={{ height: 14, width: '40%' }} />
          <div className="flex gap-2 mt-2">
            <Shimmer style={{ height: 22, width: 80, borderRadius: 99 }} />
            <Shimmer style={{ height: 22, width: 60, borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Score cards */}
      <div className="flex gap-3">
        <div className="flex-1 p-5 rounded-2xl" style={{ backgroundColor: '#13131a' }}>
          <Shimmer style={{ height: 12, width: '60%', marginBottom: 12 }} />
          <Shimmer style={{ height: 40, width: '50%' }} />
          <Shimmer style={{ height: 24, width: 70, borderRadius: 99, marginTop: 8 }} />
        </div>
        <div className="flex-1 p-5 rounded-2xl" style={{ backgroundColor: '#13131a' }}>
          <Shimmer style={{ height: 12, width: '60%', marginBottom: 12 }} />
          <Shimmer style={{ height: 40, width: '50%' }} />
          <Shimmer style={{ height: 24, width: 70, borderRadius: 99, marginTop: 8 }} />
        </div>
      </div>

      {/* Data source */}
      <Shimmer style={{ height: 40, borderRadius: 12 }} />

      {/* Nutri-Score */}
      <div className="flex gap-1.5">
        {[1,2,3,4,5].map(i => (
          <Shimmer key={i} className="flex-1" style={{ height: 36, borderRadius: 8 }} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Shimmer style={{ height: 36, flex: 1, borderRadius: 8 }} />
        <Shimmer style={{ height: 36, flex: 1, borderRadius: 8 }} />
        <Shimmer style={{ height: 36, flex: 1, borderRadius: 8 }} />
      </div>

      {/* Content */}
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <Shimmer key={i} style={{ height: 44, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
