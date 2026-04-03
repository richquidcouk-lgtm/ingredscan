'use client'

type Additive = {
  code: string
  name: string
  risk: 'low' | 'medium' | 'high'
  description: string
  regulation?: string
}

const riskColors = {
  low: '#22c77e',
  medium: '#f5a623',
  high: '#ff5a5a',
}

const riskLabels = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
}

export default function AdditiveCard({ additive, index }: { additive: Additive; index: number }) {
  return (
    <div
      className="rounded-2xl p-4 glass-card card-hover-glow"
      style={{
        animation: `fadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: '#f0f0f4', letterSpacing: '-0.01em' }}>
            {additive.code} — {additive.name}
          </p>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'rgba(240,240,244,0.45)' }}>
            {additive.description}
          </p>
          {additive.regulation && (
            <p className="text-xs mt-2" style={{ color: 'rgba(240,240,244,0.25)' }}>
              {additive.regulation}
            </p>
          )}
        </div>
        <span
          className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            backgroundColor: `${riskColors[additive.risk]}12`,
            color: riskColors[additive.risk],
            border: `1px solid ${riskColors[additive.risk]}20`,
          }}
        >
          {riskLabels[additive.risk]}
        </span>
      </div>
    </div>
  )
}
