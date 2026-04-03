'use client'

import { useCallback } from 'react'
import { getScoreLabel, getNovaLabel } from '@/lib/scoring'
import type { Product } from '@/lib/supabase'

export default function ShareButton({ product }: { product: Product }) {
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${product.name} — IngredScan`,
      text: `${product.name}: Quality ${product.quality_score}/10 (${getScoreLabel(product.quality_score)}), NOVA ${product.nova_score} (${getNovaLabel(product.nova_score)})`,
      url: `${window.location.origin}/result/${product.barcode}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      )
      alert('Link copied to clipboard!')
    }
  }, [product])

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-xl transition-transform duration-200 active:scale-90"
      style={{ backgroundColor: '#1c1c26' }}
      aria-label="Share"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16,6 12,2 8,6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  )
}
