'use client'

import { useCallback, useRef, useState } from 'react'
import { getScoreColor, getScoreLabel, getNovaLabel, getNovaEmoji } from '@/lib/scoring'
import type { Product } from '@/lib/supabase'

export default function ShareButton({ product }: { product: Product }) {
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateShareImage = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const w = 600
    const h = 400
    canvas.width = w
    canvas.height = h

    // Background
    ctx.fillStyle = '#0b0b0f'
    ctx.fillRect(0, 0, w, h)

    // Gradient accent
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, 'rgba(0,229,160,0.08)')
    grad.addColorStop(1, 'rgba(124,111,255,0.08)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Score circle
    const scoreColor = getScoreColor(product.quality_score)
    ctx.beginPath()
    ctx.arc(100, 120, 50, 0, Math.PI * 2)
    ctx.fillStyle = scoreColor + '20'
    ctx.fill()
    ctx.fillStyle = scoreColor
    ctx.font = 'bold 32px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(Math.round(product.quality_score)), 100, 130)
    ctx.font = '12px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(240,240,244,0.5)'
    ctx.fillText('/100', 100, 148)

    // Product name
    ctx.textAlign = 'left'
    ctx.fillStyle = '#f0f0f4'
    ctx.font = 'bold 22px -apple-system, sans-serif'
    const name = product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name
    ctx.fillText(name, 170, 100)

    // Brand
    ctx.fillStyle = 'rgba(240,240,244,0.5)'
    ctx.font = '14px -apple-system, sans-serif'
    ctx.fillText(product.brand || '', 170, 125)

    // Score label
    ctx.fillStyle = scoreColor
    ctx.font = 'bold 14px -apple-system, sans-serif'
    ctx.fillText(getScoreLabel(product.quality_score), 170, 150)

    // NOVA badge
    ctx.fillStyle = 'rgba(240,240,244,0.5)'
    ctx.font = '13px -apple-system, sans-serif'
    ctx.fillText(`${getNovaEmoji(product.nova_score)} ${getNovaLabel(product.nova_score)}`, 170, 175)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.beginPath()
    ctx.moveTo(40, 220)
    ctx.lineTo(w - 40, 220)
    ctx.stroke()

    // Stats row
    const stats = [
      { label: 'Quality', value: `${Math.round(product.quality_score)}/100` },
      { label: 'Processing', value: `NOVA ${product.nova_score}` },
      { label: 'Additives', value: `${(product.additives || []).length}` },
    ]
    stats.forEach((stat, i) => {
      const x = 40 + i * 180
      ctx.fillStyle = 'rgba(240,240,244,0.4)'
      ctx.font = '11px -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(stat.label, x, 252)
      ctx.fillStyle = '#f0f0f4'
      ctx.font = 'bold 18px -apple-system, sans-serif'
      ctx.fillText(stat.value, x, 275)
    })

    // Footer
    ctx.fillStyle = 'rgba(240,240,244,0.3)'
    ctx.font = '12px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Scanned with IngredScan — ingredscan.com', w / 2, 340)

    // IngredScan branding
    ctx.fillStyle = '#f0f0f4'
    ctx.font = 'bold 16px -apple-system, sans-serif'
    ctx.fillText('IngredScan', w / 2, 370)

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png')
    })
  }, [product])

  const handleShare = useCallback(async () => {
    setGenerating(true)

    const shareUrl = `${window.location.origin}/result/${product.barcode}`
    const shareText = `${product.name}: ${Math.round(product.quality_score)}/100 (${getScoreLabel(product.quality_score)}) — Scanned with IngredScan`

    // Try to generate and share image
    const blob = await generateShareImage()

    if (blob && navigator.share && navigator.canShare) {
      const file = new File([blob], `ingredscan-${product.barcode}.png`, { type: 'image/png' })
      const shareData = { text: shareText, url: shareUrl, files: [file] }

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
          setGenerating(false)
          return
        } catch {}
      }
    }

    // Fallback: text share
    if (navigator.share) {
      try {
        await navigator.share({ title: `${product.name} — IngredScan`, text: shareText, url: shareUrl })
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('Link copied!')
    }

    setGenerating(false)
  }, [product, generateShareImage])

  return (
    <>
      <button
        onClick={handleShare}
        disabled={generating}
        className="p-2 rounded-xl glass-card transition-all active:scale-90"
        aria-label="Share product"
        style={{ opacity: generating ? 0.5 : 1 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  )
}
