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
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" style={{ color: '#f0f0f4' }}>
            {swap.product_name}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: retailerColors[swap.retailer] || '#555' }}
            >
              {swap.retailer}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${novaColor}20`, color: novaColor }}
            >
              {getNovaEmoji(swap.nova_score)} NOVA {swap.nova_score}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: isSaving ? '#22c77e15' : '#f5a62315',
                color: isSaving ? '#22c77e' : '#f5a623',
              }}
            >
              {swap.price_difference}
            </span>
          </div>
          {improvement > 0 && (
            <p className="text-xs mt-2" style={{ color: '#22c77e' }}>
              ↑ Score improves by {improvement.toFixed(1)} points
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold" style={{ color: scoreColor, fontFamily: 'var(--font-clash)' }}>
            {swap.quality_score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
