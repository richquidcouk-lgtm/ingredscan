'use client'

import { useEffect, useState } from 'react'
import { getScoreColor, getScoreLabel, getNovaColor, getNovaEmoji, getNovaLabel } from '@/lib/scoring'

export function QualityScoreCard({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
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
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div
      className="flex-1 rounded-2xl p-5 transition-all duration-300 glass-card card-hover-glow"
      style={{
        background: `linear-gradient(135deg, var(--card) 0%, ${color}0d 100%)`,
        borderColor: `${color}33`,
        boxShadow: `0 2px 12px ${color}1a`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}2e`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 2px 12px ${color}1a`
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--muted)' }}>
          Quality Score
        </p>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-4 h-4 flex items-center justify-center rounded-full text-[11px] leading-none transition-colors"
          style={{
            color: showInfo ? 'var(--green)' : 'var(--muted)',
            border: `1px solid ${showInfo ? 'rgba(61,140,94,0.4)' : 'var(--border)'}`,
          }}
          aria-label="What is Quality Score?"
        >
          i
        </button>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold heading-display" style={{ color }}>
          {displayScore}
        </span>
        <span className="text-lg font-medium" style={{ color: 'var(--muted)' }}>/100</span>
      </div>
      <span
        className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}33` }}
      >
        {label}
      </span>
      {showInfo && (
        <div
          className="mt-3 rounded-xl p-3 animate-fadeUp"
          style={{ background: 'var(--soft)', border: '1px solid var(--border)' }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            Rates overall ingredient quality from 0-100. Based on nutrition (60%), additives (30%), and organic certification (10%). Higher is better.
          </p>
        </div>
      )}
    </div>
  )
}

export function NovaScoreCard({ score }: { score: number }) {
  const color = getNovaColor(score)
  const emoji = getNovaEmoji(score)
  const label = getNovaLabel(score)
  const [scale, setScale] = useState(0.8)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setScale(1.1), 100)
    const t2 = setTimeout(() => setScale(1), 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div
      className="flex-1 rounded-2xl p-5 transition-all duration-300 glass-card card-hover-glow"
      style={{
        background: `linear-gradient(135deg, var(--card) 0%, ${color}0d 100%)`,
        borderColor: `${color}33`,
        boxShadow: `0 2px 12px ${color}1a`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}2e`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 2px 12px ${color}1a`
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--muted)' }}>
          Processing Level
        </p>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-4 h-4 flex items-center justify-center rounded-full text-[11px] leading-none transition-colors"
          style={{
            color: showInfo ? 'var(--green)' : 'var(--muted)',
            border: `1px solid ${showInfo ? 'rgba(61,140,94,0.4)' : 'var(--border)'}`,
          }}
          aria-label="What is Processing Level?"
        >
          i
        </button>
      </div>
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
        style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}33` }}
      >
        {label}
      </span>
      {showInfo && (
        <div
          className="mt-3 rounded-xl p-3 animate-fadeUp"
          style={{ background: 'var(--soft)', border: '1px solid var(--border)' }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            NOVA classifies foods by processing level. 🌿 Whole Food (fruits, veg). 🧂 Culinary Ingredient (oils, flour). ⚙️ Processed (canned, cured). 🏭 Industrially Processed (contains industrial ingredients like emulsifiers, flavourings).
          </p>
        </div>
      )}
    </div>
  )
}
