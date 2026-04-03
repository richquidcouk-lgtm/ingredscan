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
      className="rounded-xl p-4 border"
      style={{
        backgroundColor: '#13131a',
        borderColor: 'rgba(255,255,255,0.08)',
        animation: `fadeUp 400ms ease ${index * 50}ms both`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm" style={{ color: '#f0f0f4' }}>
            {additive.code} — {additive.name}
          </p>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(240,240,244,0.45)' }}>
            {additive.description}
          </p>
          {additive.regulation && (
            <p className="text-xs mt-2" style={{ color: 'rgba(240,240,244,0.3)' }}>
              {additive.regulation}
            </p>
          )}
        </div>
        <span
          className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            backgroundColor: `${riskColors[additive.risk]}15`,
            color: riskColors[additive.risk],
          }}
        >
          {riskLabels[additive.risk]}
        </span>
      </div>
    </div>
  )
}
