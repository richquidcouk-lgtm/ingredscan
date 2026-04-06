'use client'

import { useState } from 'react'
import { getNovaColor, getNovaEmoji, getNovaLabel } from '@/lib/scoring'

interface ProcessingLevelCardProps {
  novaScore: number
  novaSource?: string
  specialMessage?: string | null
  specialExplanation?: string | null
}

export default function ProcessingLevelCard({
  novaScore,
  novaSource,
  specialMessage,
  specialExplanation,
}: ProcessingLevelCardProps) {
  const [showInfo, setShowInfo] = useState(false)

  // Special category override — show info message instead of NOVA
  if (specialMessage) {
    return (
      <div className="flex-1 rounded-2xl p-4 text-center" style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <p className="text-sm font-semibold" style={{ color: '#3b82f6' }}>{specialMessage}</p>
        {specialExplanation && (
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(240,240,244,0.5)' }}>{specialExplanation}</p>
        )}
      </div>
    )
  }

  const color = getNovaColor(novaScore)
  const emoji = getNovaEmoji(novaScore)
  const label = getNovaLabel(novaScore)
  const isInferred = novaSource === 'inferred'

  return (
    <>
      <div
        className="flex-1 rounded-2xl p-4 text-center relative"
        style={{
          backgroundColor: `${color}08`,
          border: isInferred ? `1px dashed ${color}30` : `1px solid ${color}15`,
        }}
      >
        {/* Info button */}
        <button
          onClick={() => setShowInfo(true)}
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(240,240,244,0.5)' }}
          aria-label="What is processing level?"
        >
          ℹ️
        </button>

        <p className="text-[11px] uppercase tracking-wider font-medium mb-1.5" style={{ color: 'rgba(240,240,244,0.4)' }}>
          Processing Level
        </p>
        <p className="text-3xl mb-1">{emoji}</p>
        <p className="text-sm font-bold" style={{ color }}>
          {isInferred ? `Likely ${label}` : label}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(240,240,244,0.5)' }}>
          NOVA {novaScore}
        </p>
        {isInferred && (
          <div className="mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,166,35,0.1)', color: '#f5a623' }}>
              Estimated
            </span>
            <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'rgba(240,240,244,0.45)' }}>
              Processing level estimated — limited data available for this product.
            </p>
          </div>
        )}
      </div>

      {/* NOVA Info Bottom Sheet */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowInfo(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div
            className="relative w-full max-w-lg rounded-t-2xl px-6 pt-6 pb-8 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: '#13131a' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />

            <h3 className="text-lg font-bold mb-4" style={{ color: '#f0f0f4' }}>
              What is a Processing Level score?
            </h3>

            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(240,240,244,0.6)' }}>
              The processing level is based on the NOVA classification system, developed by researchers at the University of São Paulo.
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(240,240,244,0.6)' }}>
              It measures how industrially processed a food is — not how healthy or unhealthy it is.
            </p>

            <div className="space-y-3 mb-5">
              {[
                { emoji: '🌿', label: 'Whole Food', desc: 'Fresh fruit, vegetables, plain meat, eggs, milk' },
                { emoji: '🧂', label: 'Culinary Ingredient', desc: 'Olive oil, butter, flour, sugar, salt' },
                { emoji: '⚙️', label: 'Processed', desc: 'Canned fish, cheese, smoked meats, sourdough bread' },
                { emoji: '🏭', label: 'Industrially Processed', desc: 'Ready meals, breakfast cereals, soft drinks, packaged snacks' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.55)' }}>
                <strong style={{ color: '#f5a623' }}>Important:</strong> Processing level is one signal, not the whole picture. Use it alongside the Quality Score for a complete view. Research suggests that diets high in industrially processed foods are associated with poorer health outcomes — but individual products vary widely.
              </p>
            </div>

            <a
              href="/blog/what-is-nova-score"
              className="block w-full text-center py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'rgba(124,111,255,0.1)', color: '#7c6fff' }}
            >
              Read our full NOVA guide →
            </a>

            <button
              onClick={() => setShowInfo(false)}
              className="block w-full text-center py-3 mt-2 text-sm"
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
