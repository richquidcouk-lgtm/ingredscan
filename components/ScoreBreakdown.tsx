'use client'

import { useState } from 'react'
import type { QualityScoreBreakdown } from '@/lib/scoring'

interface Props {
  breakdown: QualityScoreBreakdown
}

function barColor(score: number): string {
  if (score >= 70) return '#22c77e'
  if (score >= 45) return '#f5a623'
  return '#ff5a5a'
}

function nutriLabel(grade: string): string {
  switch (grade) {
    case 'a': return 'Nutri-Score A'
    case 'b': return 'Nutri-Score B'
    case 'c': return 'Nutri-Score C'
    case 'd': return 'Nutri-Score D'
    case 'e': return 'Nutri-Score E'
    default: return 'Limited data'
  }
}

function additiveLabel(score: number): string {
  if (score >= 90) return 'No concerning additives'
  if (score >= 60) return 'Some additives'
  if (score >= 30) return 'Several additives'
  return 'Many concerning additives'
}

function organicLabel(score: number): string {
  if (score >= 100) return 'Organic certified'
  return 'Not certified organic'
}

function BreakdownRow({ label, score, weight, detail }: {
  label: string; score: number; weight: string; detail: string
}) {
  const color = barColor(score)
  const pct = Math.min(100, score)

  return (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: '#f0f0f4' }}>
          {label}
          <span className="ml-1.5 text-[10px]" style={{ color: 'rgba(240,240,244,0.3)' }}>{weight}</span>
        </span>
        <span className="text-xs font-medium" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>{detail}</p>
    </div>
  )
}

export default function ScoreBreakdown({ breakdown }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="animate-fadeUp" style={{ animationDelay: '60ms' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium transition-all"
        style={{ color: 'rgba(240,240,244,0.4)' }}
      >
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
        How this score was calculated
      </button>

      {expanded && (
        <div className="rounded-2xl p-4 mt-3 glass-card animate-fadeUp">
          <BreakdownRow
            label="Nutrition"
            score={breakdown.nutritionScore}
            weight="60%"
            detail={nutriLabel(breakdown.nutriscore)}
          />
          <BreakdownRow
            label="Additives"
            score={breakdown.additiveScore}
            weight="30%"
            detail={additiveLabel(breakdown.additiveScore)}
          />
          <BreakdownRow
            label="Organic"
            score={breakdown.organicBonus}
            weight="10%"
            detail={organicLabel(breakdown.organicBonus)}
          />

          <div className="flex items-center justify-between pt-3 mt-1">
            <span className="text-xs font-semibold" style={{ color: '#f0f0f4' }}>Total</span>
            <span className="text-xs font-bold" style={{ color: barColor(breakdown.qualityScore) }}>
              {breakdown.qualityScore}/100
            </span>
          </div>

          <a href="/methodology" className="block text-[11px] mt-3 text-center" style={{ color: 'rgba(124,111,255,0.6)' }}>
            Full methodology →
          </a>
        </div>
      )}
    </div>
  )
}
