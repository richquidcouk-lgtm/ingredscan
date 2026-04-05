'use client'

import { useState } from 'react'

interface AdditiveInfo {
  code: string
  name: string
  risk: 'low' | 'medium' | 'high'
  description: string
  regulation?: string
  function?: string
  detailed_description?: string
  potential_risks?: string[]
  sources?: Array<{ title: string; url: string; year: number }>
}

interface Props {
  additive: AdditiveInfo
  index: number
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case 'high': return '#ff5a5a'
    case 'medium': return '#f5a623'
    default: return '#22c77e'
  }
}

function getRiskLabel(risk: string): string {
  switch (risk) {
    case 'high': return 'High risk'
    case 'medium': return 'Limited risk'
    default: return 'Low risk'
  }
}

export default function AdditiveDetail({ additive, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const color = getRiskColor(additive.risk)

  return (
    <>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3.5 rounded-xl transition-all glass-card animate-fadeUp"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: '#f0f0f4' }}>{additive.code}</span>
              {additive.function && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,244,0.4)' }}>
                  {additive.function}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,244,0.5)' }}>{additive.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-medium" style={{ color }}>{getRiskLabel(additive.risk)}</span>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-3 animate-fadeUp">
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.6)' }}>
              {additive.detailed_description || additive.description}
            </p>

            {additive.potential_risks && additive.potential_risks.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: 'rgba(240,240,244,0.45)' }}>Potential concerns</p>
                <div className="flex flex-wrap gap-1.5">
                  {additive.potential_risks.map(risk => (
                    <span key={risk} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}10`, color }}>
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {additive.regulation && (
              <p className="text-[10px]" style={{ color: 'rgba(240,240,244,0.45)' }}>
                Regulation: {additive.regulation}
              </p>
            )}

            {additive.sources && additive.sources.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSheet(true) }}
                className="flex items-center gap-1.5 text-[10px] font-medium"
                style={{ color: '#7c6fff' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Scientific sources ({additive.sources.length})
              </button>
            )}
          </div>
        )}
      </button>

      {/* Scientific sources bottom sheet */}
      {showSheet && additive.sources && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowSheet(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div
            className="relative w-full max-w-lg rounded-t-2xl px-6 pt-6 pb-8 max-h-[70vh] overflow-y-auto"
            style={{ backgroundColor: '#13131a' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <h3 className="text-base font-bold mb-1" style={{ color: '#f0f0f4' }}>
              Scientific Sources
            </h3>
            <p className="text-xs mb-5" style={{ color: 'rgba(240,240,244,0.4)' }}>
              {additive.code} — {additive.name}
            </p>

            <div className="space-y-4">
              {additive.sources.map((source, i) => (
                <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(240,240,244,0.45)' }}>({source.year})</p>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(240,240,244,0.7)' }}>
                    {source.title}
                  </p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium break-all"
                    style={{ color: '#7c6fff' }}
                  >
                    {source.url}
                  </a>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-3 mt-5" style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.08)' }}>
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>
                Risk classifications reflect published peer-reviewed research and EU/UK regulatory assessments. All additives listed are legally permitted in UK and EU food at regulated concentrations. IngredScan provides informational context — not medical advice.
              </p>
            </div>

            <button
              onClick={() => setShowSheet(false)}
              className="block w-full text-center py-3 mt-3 text-sm"
              style={{ color: 'rgba(240,240,244,0.4)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
