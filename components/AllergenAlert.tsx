'use client'

import { useState, useEffect } from 'react'
import { getUserAllergens, detectAllergens } from '@/lib/allergens'

interface Props {
  ingredientsText: string
}

export default function AllergenAlert({ ingredientsText }: Props) {
  const [detected, setDetected] = useState<string[]>([])

  useEffect(() => {
    const userAllergens = getUserAllergens()
    if (userAllergens.length > 0 && ingredientsText) {
      setDetected(detectAllergens(ingredientsText, userAllergens))
    }
  }, [ingredientsText])

  if (detected.length === 0) return null

  return (
    <div
      className="rounded-2xl p-4 animate-fadeUp"
      style={{
        backgroundColor: 'rgba(255,90,90,0.08)',
        border: '1px solid rgba(255,90,90,0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">⚠️</span>
        <div>
          <p className="text-sm font-bold mb-1" style={{ color: '#ff5a5a' }}>
            Allergen Alert
          </p>
          <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(240,240,244,0.6)' }}>
            Based on your allergen profile, this product may contain:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {detected.map(a => (
              <span
                key={a}
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'rgba(255,90,90,0.15)', color: '#ff5a5a' }}
              >
                {a}
              </span>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: 'rgba(240,240,244,0.35)' }}>
            Always check the physical label. Allergen detection is based on ingredient text analysis and may not capture all allergens including cross-contamination warnings.
          </p>
        </div>
      </div>
    </div>
  )
}
