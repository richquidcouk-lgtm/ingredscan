'use client'

import { getScoreColor } from '@/lib/scoring'

interface ScanData {
  barcode: string
  name: string
  quality_score: number
  scanned_at: string
}

interface Props {
  scans: ScanData[]
}

export default function WeeklySummary({ scans }: Props) {
  // Get scans from last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekScans = scans.filter(s => new Date(s.scanned_at).getTime() > weekAgo)

  if (weekScans.length < 2) return null

  const avgScore = weekScans.reduce((sum, s) => sum + s.quality_score, 0) / weekScans.length
  const bestPick = weekScans.reduce((best, s) => s.quality_score > best.quality_score ? s : best, weekScans[0])
  const worstPick = weekScans.reduce((worst, s) => s.quality_score < worst.quality_score ? s : worst, weekScans[0])

  return (
    <div className="rounded-2xl p-5 glass-card mb-4 animate-fadeUp">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📊</span>
        <h3 className="text-sm font-bold" style={{ color: '#f0f0f4' }}>Your Week in Review</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold heading-display" style={{ color: '#7c6fff' }}>{weekScans.length}</p>
          <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Products scanned</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold heading-display" style={{ color: getScoreColor(avgScore) }}>{avgScore.toFixed(1)}</p>
          <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Average score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold heading-display" style={{ color: '#22c77e' }}>{bestPick.quality_score.toFixed(1)}</p>
          <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Best pick</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(34,199,126,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs">🏆</span>
            <p className="text-xs font-medium truncate" style={{ color: '#f0f0f4', maxWidth: '180px' }}>{bestPick.name}</p>
          </div>
          <span className="text-xs font-bold" style={{ color: '#22c77e' }}>{bestPick.quality_score.toFixed(1)}</span>
        </div>
        {worstPick.barcode !== bestPick.barcode && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,90,90,0.04)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs">📉</span>
              <p className="text-xs font-medium truncate" style={{ color: '#f0f0f4', maxWidth: '180px' }}>{worstPick.name}</p>
            </div>
            <span className="text-xs font-bold" style={{ color: getScoreColor(worstPick.quality_score) }}>{worstPick.quality_score.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
