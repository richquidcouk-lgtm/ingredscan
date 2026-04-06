'use client'

import { useState } from 'react'
import type { QualityScoreBreakdown } from '@/lib/scoring'

interface Props {
  breakdown: QualityScoreBreakdown
}

function barColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return '#22c77e'
  if (pct >= 0.5) return '#f5a623'
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

function novaLabel(nova: number): string {
  switch (nova) {
    case 1: return 'Whole food'
    case 2: return 'Culinary ingredient'
    case 3: return 'Processed'
    case 4: return 'Industrially processed'
    default: return 'Unknown'
  }
}

function additiveLabel(score: number): string {
  if (score >= 1.8) return 'No concerning additives'
  if (score >= 1.2) return 'Some additives'
  if (score >= 0.5) return 'Several additives'
  return 'Many concerning additives'
}

function organicLabel(score: number): string {
  if (score >= 0.5) return 'Organic certified'
  if (score >= 0.25) return 'Some certifications'
  return 'Not certified organic'
}

function BreakdownRow({ label, score, max, detail }: {
  label: string; score: number; max: number; detail: string
}) {
  const color = barColor(score, max)
  const pct = Math.min(100, (score / max) * 100)

  return (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: '#f0f0f4' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color }}>
          {score.toFixed(1)}/{max.toFixed(1)}
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
            label="Nutritional Quality"
            score={breakdown.nutritional}
            max={5.0}
            detail={nutriLabel(breakdown.nutriscore)}
          />
          <BreakdownRow
            label="Processing Level"
            score={breakdown.processing}
            max={2.5}
            detail={novaLabel(breakdown.nova)}
          />
          <BreakdownRow
            label="Additives"
            score={breakdown.additives}
            max={2.0}
            detail={additiveLabel(breakdown.additives)}
          />
          <BreakdownRow
            label="Organic"
            score={breakdown.organic}
            max={0.5}
            detail={organicLabel(breakdown.organic)}
          />

          <div className="flex items-center justify-between pt-3 mt-1">
            <span className="text-xs font-semibold" style={{ color: '#f0f0f4' }}>Total</span>
            <span className="text-xs font-bold" style={{ color: barColor(breakdown.total, 10) }}>
              {breakdown.total.toFixed(1)}/10
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
