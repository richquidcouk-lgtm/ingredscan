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
      className="shrink-0 w-[200px] rounded-2xl p-4 glass-card"
      style={{
        animation: `fadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
      }}
    >
      {/* Score at top */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="px-2 py-0.5 rounded-md text-[10px] font-medium text-white"
          style={{ backgroundColor: retailerColor }}
        >
          {swap.retailer}
        </span>
        <span className="text-xl font-extrabold heading-display" style={{ color: scoreColor }}>
          {swap.quality_score.toFixed(1)}
        </span>
      </div>

      {/* Product name */}
      <p className="font-semibold text-sm leading-tight mb-2" style={{ color: '#f0f0f4', letterSpacing: '-0.01em' }}>
        {swap.product_name}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{ backgroundColor: `${novaColor}15`, color: novaColor, border: `1px solid ${novaColor}20` }}
        >
          {getNovaEmoji(swap.nova_score)} NOVA {swap.nova_score}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            backgroundColor: isSaving ? '#00e5a012' : '#f5a62312',
            color: isSaving ? '#00e5a0' : '#f5a623',
            border: `1px solid ${isSaving ? '#00e5a020' : '#f5a62320'}`,
          }}
        >
          {swap.price_difference}
        </span>
      </div>

      {/* Improvement */}
      {improvement > 0 && (
        <p className="text-[10px] mt-2 font-medium" style={{ color: '#00e5a0' }}>
          +{improvement.toFixed(1)} pts better
        </p>
      )}
    </div>
  )
}
