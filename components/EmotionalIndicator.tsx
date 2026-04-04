'use client'

import { useEffect, useState } from 'react'

function getEmotionalData(qualityScore: number) {
  if (qualityScore >= 9) return { emoji: '\uD83C\uDF1F', verdict: 'Excellent', bg: 'rgba(0,229,160,0.15)', border: 'rgba(0,229,160,0.25)', color: '#00e5a0' }
  if (qualityScore >= 7) return { emoji: '\uD83D\uDE0A', verdict: 'Good', bg: 'rgba(0,229,160,0.1)', border: 'rgba(0,229,160,0.2)', color: '#00e5a0' }
  if (qualityScore >= 5) return { emoji: '\uD83D\uDE42', verdict: 'Decent', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.2)', color: '#f5a623' }
  if (qualityScore >= 3) return { emoji: '\uD83D\uDE15', verdict: 'Moderate', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)', color: '#f5a623' }
  return { emoji: '\uD83D\uDE30', verdict: 'Poor', bg: 'rgba(255,90,90,0.1)', border: 'rgba(255,90,90,0.25)', color: '#ff5a5a' }
}

export default function EmotionalIndicator({ qualityScore }: { qualityScore: number }) {
  const [scale, setScale] = useState(0.5)
  const data = getEmotionalData(qualityScore)

  useEffect(() => {
    // Spring-like bounce animation
    const t1 = setTimeout(() => setScale(1.15), 100)
    const t2 = setTimeout(() => setScale(0.95), 300)
    const t3 = setTimeout(() => setScale(1.02), 450)
    const t4 = setTimeout(() => setScale(1), 550)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <div
      className="flex flex-col items-center py-5 rounded-2xl animate-fadeUp glass-card"
      style={{
        background: `linear-gradient(135deg, rgba(19,19,26,0.7) 0%, ${data.bg} 100%)`,
        borderColor: data.border,
      }}
    >
      {/* Pulsing background circle */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full emotional-pulse"
          style={{
            backgroundColor: data.bg,
            width: 72,
            height: 72,
            top: -4,
            left: -4,
          }}
        />
        <div
          className="relative text-5xl leading-none transition-transform"
          style={{
            transform: `scale(${scale})`,
            transitionDuration: '300ms',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {data.emoji}
        </div>
      </div>
      <span
        className="text-xl font-bold heading-display mt-2"
        style={{ color: data.color, letterSpacing: '-0.03em' }}
      >
        {data.verdict}
      </span>
    </div>
  )
}
