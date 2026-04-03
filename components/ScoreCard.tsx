'use client'

import { useEffect, useState } from 'react'
import { getScoreColor, getScoreLabel, getNovaColor, getNovaEmoji, getNovaLabel } from '@/lib/scoring'

export function QualityScoreCard({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  useEffect(() => {
    const duration = 600
    const steps = 30
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current * 10) / 10)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div
      className="flex-1 rounded-2xl p-5 transition-all duration-300 glass-card card-hover-glow"
      style={{
        background: `linear-gradient(135deg, rgba(19,19,26,0.8) 0%, ${color}08 100%)`,
        borderColor: `${color}20`,
        boxShadow: `0 0 24px ${color}10, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 40px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 24px ${color}10, inset 0 1px 0 rgba(255,255,255,0.03)`
      }}
    >
      <p className="text-[11px] uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
        Quality Score
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold heading-display" style={{ color }}>
          {displayScore.toFixed(1)}
        </span>
        <span className="text-lg font-medium" style={{ color: 'rgba(240,240,244,0.35)' }}>/10</span>
      </div>
      <span
        className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}20` }}
      >
        {label}
      </span>
    </div>
  )
}

export function NovaScoreCard({ score }: { score: number }) {
  const color = getNovaColor(score)
  const emoji = getNovaEmoji(score)
  const label = getNovaLabel(score)
  const [scale, setScale] = useState(0.8)

  useEffect(() => {
    const t1 = setTimeout(() => setScale(1.1), 100)
    const t2 = setTimeout(() => setScale(1), 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div
      className="flex-1 rounded-2xl p-5 transition-all duration-300 glass-card card-hover-glow"
      style={{
        background: `linear-gradient(135deg, rgba(19,19,26,0.8) 0%, ${color}08 100%)`,
        borderColor: `${color}20`,
        boxShadow: `0 0 24px ${color}10, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 40px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 24px ${color}10, inset 0 1px 0 rgba(255,255,255,0.03)`
      }}
    >
      <p className="text-[11px] uppercase tracking-wider mb-3 font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
        Processing Level
      </p>
      <div className="flex items-center gap-3">
        <span
          className="text-4xl transition-transform duration-400"
          style={{ transform: `scale(${scale})` }}
        >
          {emoji}
        </span>
        <span className="text-2xl font-extrabold heading-display" style={{ color }}>
          NOVA {score}
        </span>
      </div>
      <span
        className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}20` }}
      >
        {label}
      </span>
    </div>
  )
}
