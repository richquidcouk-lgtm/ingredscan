'use client'

import { getNovaColor, getNovaEmoji, getScoreColor } from '@/lib/scoring'

type Swap = {
  product_name: string
  retailer: string
  nova_score: number
  quality_score: number
  price_difference: string
}

const retailerColors: Record<string, string> = {
  Tesco: '#00539f',
  "Sainsbury's": '#f06c00',
  Asda: '#78b832',
  Waitrose: '#006837',
}

export default function SwapCard({
  swap,
  currentScore,
  index,
}: {
  swap: Swap
  currentScore: number
  index: number
}) {
  const improvement = Math.round((swap.quality_score - currentScore) * 10) / 10
  const scoreColor = getScoreColor(swap.quality_score)
  const novaColor = getNovaColor(swap.nova_score)
  const isSaving = swap.price_difference.startsWith('-') || swap.price_difference.toLowerCase().startsWith('save')
  const retailerColor = retailerColors[swap.retailer] || '#555'

  return (
    <div
      className="rounded-2xl p-4 glass-card card-hover-glow"
      style={{
        animation: `fadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: '#f0f0f4', letterSpacing: '-0.01em' }}>
            {swap.product_name}
          </p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: retailerColor, boxShadow: `0 0 8px ${retailerColor}30` }}
            >
              {swap.retailer}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${novaColor}15`, color: novaColor, border: `1px solid ${novaColor}20` }}
            >
              {getNovaEmoji(swap.nova_score)} NOVA {swap.nova_score}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: isSaving ? '#22c77e12' : '#f5a62312',
                color: isSaving ? '#22c77e' : '#f5a623',
                border: `1px solid ${isSaving ? '#22c77e20' : '#f5a62320'}`,
              }}
            >
              {swap.price_difference}
            </span>
          </div>
          {improvement > 0 && (
            <p className="text-xs mt-2.5 font-medium" style={{ color: '#22c77e' }}>
              ↑ Score improves by {improvement.toFixed(1)} points
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-extrabold heading-display" style={{ color: scoreColor }}>
            {swap.quality_score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
