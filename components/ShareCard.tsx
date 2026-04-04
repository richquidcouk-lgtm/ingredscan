'use client'

import { useCallback, useState } from 'react'
import { getScoreLabel, getNovaLabel } from '@/lib/scoring'
import type { Product } from '@/lib/supabase'

function getEmotionalEmoji(score: number): string {
  if (score >= 9) return '\uD83C\uDF1F'
  if (score >= 7) return '\uD83D\uDE0A'
  if (score >= 5) return '\uD83D\uDE42'
  if (score >= 3) return '\uD83D\uDE15'
  return '\uD83D\uDE30'
}

function getWorstIngredients(product: Product): string[] {
  const additives = product.additives || []
  const high = additives.filter(a => a.risk === 'high').map(a => a.name)
  const medium = additives.filter(a => a.risk === 'medium').map(a => a.name)
  return [...high, ...medium].slice(0, 3)
}

export default function ShareButton({ product }: { product: Product }) {
  const [generating, setGenerating] = useState(false)

  const generateShareCard = useCallback(async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background
    ctx.fillStyle = '#0b0b0f'
    ctx.fillRect(0, 0, 1080, 1080)

    // Green accent border
    ctx.strokeStyle = '#00e5a0'
    ctx.lineWidth = 4
    ctx.roundRect(20, 20, 1040, 1040, 24)
    ctx.stroke()

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.roundRect(40, 40, 1000, 1000, 16)
    ctx.stroke()

    // Logo text
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.fillStyle = '#f0f0f4'
    ctx.fillText('Ingred', 80, 110)
    ctx.fillStyle = '#00e5a0'
    ctx.fillText('Scan', 80 + ctx.measureText('Ingred').width, 110)

    // Product name
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.fillStyle = '#f0f0f4'
    const name = product.name.length > 30 ? product.name.slice(0, 30) + '...' : product.name
    ctx.fillText(name, 80, 200)

    // Brand
    ctx.font = '28px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240,240,244,0.4)'
    ctx.fillText(product.brand || '', 80, 245)

    // Large emoji
    ctx.font = '160px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(getEmotionalEmoji(product.quality_score), 540, 460)
    ctx.textAlign = 'left'

    // Verdict word
    const verdict = product.quality_score >= 9 ? 'Excellent' : product.quality_score >= 7 ? 'Good' : product.quality_score >= 5 ? 'Decent' : product.quality_score >= 3 ? 'Moderate' : 'Poor'
    ctx.font = 'bold 56px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = product.quality_score >= 7 ? '#00e5a0' : product.quality_score >= 5 ? '#f5a623' : '#ff5a5a'
    ctx.fillText(verdict, 540, 530)

    // Quality Score box
    const scoreColor = product.quality_score >= 7 ? '#00e5a0' : product.quality_score >= 4.5 ? '#f5a623' : '#ff5a5a'
    ctx.fillStyle = `${scoreColor}15`
    ctx.roundRect(180, 580, 300, 120, 20)
    ctx.fill()
    ctx.strokeStyle = `${scoreColor}40`
    ctx.lineWidth = 1
    ctx.roundRect(180, 580, 300, 120, 20)
    ctx.stroke()

    ctx.font = '16px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240,240,244,0.4)'
    ctx.textAlign = 'center'
    ctx.fillText('QUALITY SCORE', 330, 620)
    ctx.font = 'bold 52px system-ui, sans-serif'
    ctx.fillStyle = scoreColor
    ctx.fillText(`${product.quality_score.toFixed(1)}/10`, 330, 680)

    // NOVA Score box
    const novaColor = product.nova_score <= 2 ? '#00e5a0' : product.nova_score === 3 ? '#f5a623' : '#ff5a5a'
    ctx.fillStyle = `${novaColor}15`
    ctx.roundRect(600, 580, 300, 120, 20)
    ctx.fill()
    ctx.strokeStyle = `${novaColor}40`
    ctx.lineWidth = 1
    ctx.roundRect(600, 580, 300, 120, 20)
    ctx.stroke()

    ctx.font = '16px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240,240,244,0.4)'
    ctx.fillText('NOVA SCORE', 750, 620)
    ctx.font = 'bold 52px system-ui, sans-serif'
    ctx.fillStyle = novaColor
    ctx.fillText(`NOVA ${product.nova_score}`, 750, 680)
    ctx.textAlign = 'left'

    // Worst ingredients
    const worst = getWorstIngredients(product)
    if (worst.length > 0) {
      ctx.font = '20px system-ui, sans-serif'
      ctx.fillStyle = 'rgba(240,240,244,0.3)'
      ctx.fillText('Watch out for:', 80, 770)
      ctx.font = '24px system-ui, sans-serif'
      ctx.fillStyle = '#ff5a5a'
      worst.forEach((ing, i) => {
        ctx.fillText(`• ${ing}`, 100, 810 + i * 36)
      })
    }

    // Watermark
    ctx.font = '22px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240,240,244,0.2)'
    ctx.textAlign = 'center'
    ctx.fillText('ingredscan.com', 540, 1030)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }, [product])

  const handleShare = useCallback(async () => {
    setGenerating(true)

    try {
      const blob = await generateShareCard()

      if (blob && navigator.share) {
        const file = new File([blob], `ingredscan-${product.barcode}.png`, { type: 'image/png' })
        try {
          await navigator.share({
            title: `${product.name} — IngredScan`,
            text: `${product.name}: Quality ${product.quality_score}/10, NOVA ${product.nova_score}`,
            files: [file],
          })
          setGenerating(false)
          return
        } catch {
          // Fallback to text share
        }
      }

      // Fallback: text-based share or clipboard
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
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        alert('Link copied to clipboard!')
      }
    } catch {
      // Fallback
    }

    setGenerating(false)
  }, [product, generateShareCard])

  return (
    <button
      onClick={handleShare}
      disabled={generating}
      className="p-2 rounded-xl transition-transform duration-200 active:scale-90 disabled:opacity-50"
      style={{ backgroundColor: '#1c1c26' }}
      aria-label="Share"
    >
      {generating ? (
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#f0f0f4', borderTopColor: 'transparent' }} />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16,6 12,2 8,6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  )
}
