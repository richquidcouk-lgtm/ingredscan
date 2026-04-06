'use client'

import { useState, useEffect } from 'react'
import { UK_ALLERGENS, getUserAllergens, setUserAllergens } from '@/lib/allergens'

export default function AllergenSettings() {
  const [selected, setSelected] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSelected(getUserAllergens())
  }, [])

  function toggle(id: string) {
    setSaved(false)
    setSelected(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function handleSave() {
    setUserAllergens(selected)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-2xl overflow-hidden glass-card">
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-sm font-semibold" style={{ color: '#f0f0f4' }}>Allergen Alerts</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,244,0.45)' }}>
          Select your allergens — we&apos;ll warn you when a product may contain them
        </p>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {UK_ALLERGENS.map(a => (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: selected.includes(a.id) ? 'rgba(255,90,90,0.15)' : 'rgba(255,255,255,0.03)',
                color: selected.includes(a.id) ? '#ff5a5a' : 'rgba(240,240,244,0.45)',
                border: `1px solid ${selected.includes(a.id) ? 'rgba(255,90,90,0.25)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            backgroundColor: saved ? 'rgba(34,199,126,0.15)' : 'rgba(124,111,255,0.15)',
            color: saved ? '#22c77e' : '#7c6fff',
          }}
        >
          {saved ? 'Saved!' : 'Save Allergen Profile'}
        </button>
      </div>
    </div>
  )
}
