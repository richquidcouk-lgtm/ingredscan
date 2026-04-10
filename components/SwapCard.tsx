'use client'

import { getNovaColor, getScoreColor } from '@/lib/scoring'

type Swap = {
  product_name: string
  retailer: string
  nova_score: number
  quality_score: number
  price_difference?: string
}

const retailerColors: Record<string, string> = {
  Tesco: '#00539f',
  "Sainsbury's": '#f06c00',
  Asda: '#78b832',
  Waitrose: '#006837',
  'M&S': '#2e2e2e',
  Morrisons: '#007a33',
  Aldi: '#00005f',
  Lidl: '#0050aa',
  'Whole Foods': '#00674b',
  "Trader Joe's": '#c8102e',
  Kroger: '#0063a7',
  Target: '#cc0000',
  Walmart: '#0071ce',
  Costco: '#e31837',
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
  const improvement = Math.round(swap.quality_score - currentScore)
  const scoreColor = getScoreColor(swap.quality_score)
  const novaColor = getNovaColor(swap.nova_score)
  const retailerColor = retailerColors[swap.retailer] || '#555'

  return (
    <div
      className="w-full rounded-2xl p-4 glass-card"
      style={{
        animation: `fadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-white shrink-0"
              style={{ backgroundColor: retailerColor }}
            >
              {swap.retailer}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
              style={{ backgroundColor: `${novaColor}15`, color: novaColor, border: `1px solid ${novaColor}20` }}
            >
              NOVA {swap.nova_score}
            </span>
          </div>
          <p className="font-semibold text-sm leading-tight" style={{ color: '#f0f0f4', letterSpacing: '-0.01em' }}>
            {swap.product_name}
          </p>
          {improvement > 0 && (
            <p className="text-[11px] mt-1 font-medium" style={{ color: '#00e5a0' }}>
              +{improvement} on our criteria
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <span className="text-2xl font-extrabold heading-display" style={{ color: scoreColor }}>
            {Math.round(swap.quality_score)}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'rgba(240,240,244,0.5)' }}>
            Score
          </span>
        </div>
      </div>
    </div>
  )
}
