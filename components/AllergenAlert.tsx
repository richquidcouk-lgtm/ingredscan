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
      className="mx-5 mt-4 rounded-2xl p-4 animate-fadeUp"
      style={{
        backgroundColor: 'var(--red-bg)',
        border: '1.5px solid var(--red)',
      }}
    >
      <div className="flex items-start gap-3">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 mt-0.5"
          style={{ color: 'var(--red)' }}
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--red-deep)' }}>
            Allergen Warning
          </p>
          <p className="text-xs leading-relaxed mb-2.5" style={{ color: 'var(--red-deep)', opacity: 0.75 }}>
            Based on your allergen profile, this product may contain:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {detected.map(a => (
              <span
                key={a}
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'var(--red)', color: '#fff' }}
              >
                {a}
              </span>
            ))}
          </div>
          <p className="text-xs mt-2.5" style={{ color: 'var(--red-deep)', opacity: 0.55 }}>
            Always check the physical label. Allergen detection is based on ingredient text and may not capture cross-contamination warnings.
          </p>
        </div>
      </div>
    </div>
  )
}
