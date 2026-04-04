'use client'

import { useState } from 'react'

type Additive = {
  code: string
  name: string
  risk: 'low' | 'medium' | 'high'
  description: string
  regulation?: string
}

const riskColors = {
  low: '#00e5a0',
  medium: '#f5a623',
  high: '#ff5a5a',
}

export default function AdditiveCard({ additive, index }: { additive: Additive; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        animation: `fadeUp 500ms cubic-bezier(0.16,1,0.3,1) ${index * 50}ms both`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-3.5 text-left transition-colors"
      >
        {/* Risk dot */}
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: riskColors[additive.risk] }}
        />
        {/* Name + code */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>
            {additive.name}
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(240,240,244,0.35)' }}>
            {additive.code}
          </p>
        </div>
        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(240,240,244,0.3)"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="pb-3.5 pl-5.5 animate-fadeUp" style={{ paddingLeft: '22px' }}>
          <p className="text-sm leading-relaxed mb-1.5" style={{ color: 'rgba(240,240,244,0.5)' }}>
            {additive.description}
          </p>
          {additive.regulation && (
            <p className="text-xs" style={{ color: 'rgba(240,240,244,0.25)' }}>
              {additive.regulation}
            </p>
          )}
          <span
            className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: `${riskColors[additive.risk]}12`,
              color: riskColors[additive.risk],
              border: `1px solid ${riskColors[additive.risk]}20`,
            }}
          >
            {additive.risk === 'low' ? 'Low risk' : additive.risk === 'medium' ? 'Medium risk' : 'High risk'}
          </span>
        </div>
      )}
    </div>
  )
}
