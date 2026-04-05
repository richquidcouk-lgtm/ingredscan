'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getNovaColor, getScoreColor } from '@/lib/scoring'
import { searchProducts } from '@/lib/openFoodFacts'

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
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const improvement = Math.round((swap.quality_score - currentScore) * 10) / 10
  const scoreColor = getScoreColor(swap.quality_score)
  const novaColor = getNovaColor(swap.nova_score)
  const isSaving = swap.price_difference.startsWith('-') || swap.price_difference.toLowerCase().startsWith('save')
  const retailerColor = retailerColors[swap.retailer] || '#555'

  async function handleTap() {
    setLoading(true)
    try {
      const results = await searchProducts(swap.product_name)
      if (results.products && results.products.length > 0) {
        const match = results.products[0]
        router.push(`/result/${match.code}?source=scan`)
        return
      }
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={handleTap}
      disabled={loading}
      className="w-full text-left rounded-2xl p-4 glass-card transition-all active:scale-[0.98]"
      style={{
        animation: `fadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Left: retailer + product info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-medium text-white shrink-0"
              style={{ backgroundColor: retailerColor }}
            >
              {swap.retailer}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0"
              style={{ backgroundColor: `${novaColor}15`, color: novaColor, border: `1px solid ${novaColor}20` }}
            >
              NOVA {swap.nova_score}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0"
              style={{
                backgroundColor: isSaving ? '#00e5a012' : '#f5a62312',
                color: isSaving ? '#00e5a0' : '#f5a623',
                border: `1px solid ${isSaving ? '#00e5a020' : '#f5a62320'}`,
              }}
            >
              {swap.price_difference}
            </span>
          </div>
          <p className="font-semibold text-sm leading-tight" style={{ color: '#f0f0f4', letterSpacing: '-0.01em' }}>
            {swap.product_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {improvement > 0 && (
              <p className="text-[10px] font-medium" style={{ color: '#00e5a0' }}>
                +{improvement.toFixed(1)} pts better
              </p>
            )}
            <p className="text-[10px]" style={{ color: 'rgba(240,240,244,0.25)' }}>
              Tap to view details
            </p>
          </div>
        </div>

        {/* Right: score + arrow */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <span className="text-2xl font-extrabold heading-display" style={{ color: scoreColor }}>
            {swap.quality_score.toFixed(1)}
          </span>
          <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'rgba(240,240,244,0.35)' }}>
            Score
          </span>
          {loading ? (
            <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin mt-1" style={{ borderColor: '#7c6fff', borderTopColor: 'transparent' }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.2)" strokeWidth="2" className="mt-1">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}
