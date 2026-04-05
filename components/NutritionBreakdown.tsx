'use client'

import { useState } from 'react'
import type { NutritionData } from '@/lib/supabase'

interface Props {
  nutrition: NutritionData
  additiveCount: number
}

type RagLevel = 'good' | 'moderate' | 'poor'

interface NutrientRow {
  key: string
  label: string
  value: number | null
  unit: string
  rag: RagLevel
  description: string
  max: number
  icon: string
}

function getRag(value: number | null, thresholds: { good: number; moderate: number }): RagLevel {
  if (value == null) return 'good'
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.moderate) return 'moderate'
  return 'poor'
}

function getRagReversed(value: number | null, thresholds: { poor: number; moderate: number }): RagLevel {
  if (value == null) return 'moderate'
  if (value < thresholds.poor) return 'poor'
  if (value < thresholds.moderate) return 'moderate'
  return 'good'
}

function ragColor(rag: RagLevel): string {
  switch (rag) {
    case 'good': return '#22c77e'
    case 'moderate': return '#f5a623'
    case 'poor': return '#ff5a5a'
  }
}

function getNegatives(n: NutritionData, additiveCount: number): NutrientRow[] {
  const rows: NutrientRow[] = []

  const satRag = getRag(n.saturated_fat, { good: 1.5, moderate: 5 })
  rows.push({
    key: 'saturates',
    label: 'Saturates',
    value: n.saturated_fat,
    unit: 'g',
    rag: satRag,
    description: satRag === 'good' ? 'Low saturates' : satRag === 'moderate' ? 'Some saturates' : 'High saturates',
    max: 10,
    icon: '💧',
  })

  const sugarRag = getRag(n.sugars, { good: 5, moderate: 12.5 })
  rows.push({
    key: 'sugar',
    label: 'Sugar',
    value: n.sugars,
    unit: 'g',
    rag: sugarRag,
    description: sugarRag === 'good' ? 'Low sugar' : sugarRag === 'moderate' ? 'Some sugar' : 'High sugar',
    max: 25,
    icon: '🍬',
  })

  const saltRag = getRag(n.salt, { good: 0.3, moderate: 1.5 })
  rows.push({
    key: 'salt',
    label: 'Salt',
    value: n.salt,
    unit: 'g',
    rag: saltRag,
    description: saltRag === 'good' ? 'Low salt' : saltRag === 'moderate' ? 'Some salt' : 'High salt',
    max: 3,
    icon: '🧂',
  })

  if (additiveCount > 0) {
    const addRag: RagLevel = additiveCount >= 5 ? 'poor' : additiveCount >= 2 ? 'moderate' : 'good'
    rows.push({
      key: 'additives',
      label: 'Additives',
      value: additiveCount,
      unit: '',
      rag: addRag,
      description: addRag === 'good' ? 'Few additives' : addRag === 'moderate' ? 'Contains additives' : 'Many additives',
      max: 10,
      icon: '🧪',
    })
  }

  return rows
}

function getPositives(n: NutritionData): NutrientRow[] {
  const rows: NutrientRow[] = []

  const protRag = getRagReversed(n.protein, { poor: 2, moderate: 5 })
  rows.push({
    key: 'protein',
    label: 'Protein',
    value: n.protein,
    unit: 'g',
    rag: protRag,
    description: protRag === 'good' ? 'Good protein' : protRag === 'moderate' ? 'Some protein' : 'Low protein',
    max: 20,
    icon: '💪',
  })

  const fibreRag = getRagReversed(n.fibre, { poor: 1.5, moderate: 3 })
  rows.push({
    key: 'fibre',
    label: 'Fibre',
    value: n.fibre,
    unit: 'g',
    rag: fibreRag,
    description: fibreRag === 'good' ? 'Good fibre' : fibreRag === 'moderate' ? 'Some fibre' : 'Low fibre',
    max: 10,
    icon: '🌾',
  })

  const energyRag: RagLevel = (n.energy || 0) > 400 ? 'moderate' : 'good'
  rows.push({
    key: 'energy',
    label: 'Energy',
    value: n.energy,
    unit: 'kcal',
    rag: energyRag,
    description: energyRag === 'good' ? 'Moderate calories' : 'High calories',
    max: 600,
    icon: '⚡',
  })

  return rows
}

function NutrientRowComponent({ row }: { row: NutrientRow }) {
  const [expanded, setExpanded] = useState(false)
  const color = ragColor(row.rag)
  const percentage = row.value != null ? Math.min((row.value / row.max) * 100, 100) : 0

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left py-3.5 transition-all"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-base w-7 text-center shrink-0">{row.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>{row.label}</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>{row.description}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-sm font-medium" style={{ color: '#f0f0f4' }}>
                {row.value != null ? `${Number(row.value).toFixed(1)}${row.unit}` : '\u2014'}
              </span>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.45)" strokeWidth="2.5"
                className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar — shown when expanded */}
      {expanded && row.value != null && (
        <div className="mt-3 ml-10 animate-fadeUp">
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.4)' }}>0</span>
            <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.4)' }}>{row.max}{row.unit}</span>
          </div>
        </div>
      )}
    </button>
  )
}

export default function NutritionBreakdown({ nutrition, additiveCount }: Props) {
  const negatives = getNegatives(nutrition, additiveCount)
  const positives = getPositives(nutrition)

  const hasNegativeData = negatives.some(r => r.value != null)
  const hasPositiveData = positives.some(r => r.value != null)

  if (!hasNegativeData && !hasPositiveData) return null

  return (
    <div className="space-y-4">
      {/* Negatives */}
      {hasNegativeData && (
        <div className="rounded-2xl p-5 glass-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs uppercase tracking-wider font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Negatives
            </h3>
            <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.4)' }}>Per 100g</span>
          </div>
          <div>
            {negatives.map(row => (
              <NutrientRowComponent key={row.key} row={row} />
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {hasPositiveData && (
        <div className="rounded-2xl p-5 glass-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs uppercase tracking-wider font-medium" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Positives
            </h3>
            <span className="text-[10px]" style={{ color: 'rgba(240,240,244,0.4)' }}>Per 100g</span>
          </div>
          <div>
            {positives.map(row => (
              <NutrientRowComponent key={row.key} row={row} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
