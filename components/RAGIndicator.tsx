'use client'

import { getScoreColor, getScoreLabel } from '@/lib/scoring'

const RAG_CONFIG = [
  { key: 'red', color: '#ff5a5a', label: 'Low ingredient quality', min: 0, max: 3.9 },
  { key: 'amber', color: '#f5a623', label: 'Mixed ingredient quality', min: 4, max: 6.9 },
  { key: 'green', color: '#00e5a0', label: 'High ingredient quality', min: 7, max: 10 },
]

export default function RAGIndicator({ score }: { score: number }) {
  const activeColor = getScoreColor(score)
  const activeLabel = getScoreLabel(score)
  const activeDescription = score < 4
    ? 'Low ingredient quality'
    : score < 7
    ? 'Mixed ingredient quality'
    : 'High ingredient quality'

  return (
    <div className="rounded-2xl p-4 glass-card">
      <div className="flex items-center justify-between">
        {/* Traffic light dots */}
        <div className="flex items-center gap-5">
          {RAG_CONFIG.map(({ key, color, min, max }) => {
            const isActive = score >= min && score <= max
            return (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-8 h-8 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? color : `${color}15`,
                    border: `2px solid ${isActive ? color : `${color}30`}`,
                    boxShadow: isActive ? `0 0 12px ${color}40` : 'none',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
                <span
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: isActive ? color : 'rgba(240,240,244,0.4)' }}
                >
                  {key === 'red' ? 'Low' : key === 'amber' ? 'Mixed' : 'High'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Verdict */}
        <div className="text-right">
          <p className="text-lg font-bold heading-display" style={{ color: activeColor }}>
            {activeLabel}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,244,0.4)' }}>
            {activeDescription}
          </p>
        </div>
      </div>
    </div>
  )
}
