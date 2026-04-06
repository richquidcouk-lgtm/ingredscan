'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const UK_RETAILERS = [
  'Tesco', "Sainsbury's", 'Asda', 'Waitrose', 'Morrisons',
  'Aldi', 'Lidl', 'Co-op', 'M&S', 'Ocado', 'Iceland', 'Boots',
  'Holland & Barrett', 'Amazon',
]

const RETAILER_COLORS: Record<string, string> = {
  'Tesco': '#00539f',
  "Sainsbury's": '#f06c00',
  'Asda': '#78b832',
  'Waitrose': '#006837',
  'Morrisons': '#007a33',
  'Aldi': '#00005f',
  'Lidl': '#0050aa',
  'Co-op': '#00b1e7',
  'M&S': '#2e2e2e',
  'Ocado': '#5c2d91',
  'Iceland': '#e51a22',
  'Boots': '#0055a5',
}

interface Props {
  barcode: string
  offRetailers?: string[]
}

export default function RetailerInfo({ barcode, offRetailers = [] }: Props) {
  const [communityRetailers, setCommunityRetailers] = useState<string[]>([])
  const [showReport, setShowReport] = useState(false)
  const [selectedRetailer, setSelectedRetailer] = useState('')
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadCommunityData()
  }, [barcode])

  async function loadCommunityData() {
    try {
      const res = await fetch(`/api/purchase-report?barcode=${barcode}`)
      if (res.ok) {
        const data = await res.json()
        setCommunityRetailers(data.retailers?.map((r: any) => r.name) || [])
      }
    } catch {}
  }

  async function handleSubmit() {
    if (!selectedRetailer) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    await fetch('/api/purchase-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode,
        retailer: selectedRetailer,
        price: price ? parseFloat(price) : null,
        userId: user?.id || null,
      }),
    })

    setSubmitted(true)
    setSubmitting(false)
    setCommunityRetailers(prev => prev.includes(selectedRetailer) ? prev : [...prev, selectedRetailer])
  }

  // Merge OFF retailers + community retailers, deduplicate
  const allRetailers = Array.from(new Set([...offRetailers, ...communityRetailers]))

  return (
    <div className="space-y-3">
      {/* Available at */}
      {allRetailers.length > 0 && (
        <div className="rounded-2xl p-4 glass-card">
          <p className="text-xs uppercase tracking-wider font-medium mb-2.5" style={{ color: 'rgba(240,240,244,0.4)' }}>
            Available at
          </p>
          <div className="flex flex-wrap gap-2">
            {allRetailers.map(retailer => (
              <span
                key={retailer}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                style={{
                  backgroundColor: `${RETAILER_COLORS[retailer] || '#555'}15`,
                  color: RETAILER_COLORS[retailer] || 'rgba(240,240,244,0.5)',
                  border: `1px solid ${RETAILER_COLORS[retailer] || '#555'}25`,
                }}
              >
                {retailer}
              </span>
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'rgba(240,240,244,0.3)' }}>
            Based on Open Food Facts data and community reports. Availability may vary.
          </p>
        </div>
      )}

      {/* Where did you buy this? */}
      {!submitted ? (
        <button
          onClick={() => setShowReport(!showReport)}
          className="w-full rounded-2xl p-4 glass-card text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(34,199,126,0.1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c77e" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#f0f0f4' }}>Where did you buy this?</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.45)' }}>Help others find this product — tap to report</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'rgba(34,199,126,0.06)', border: '1px solid rgba(34,199,126,0.12)' }}>
          <p className="text-sm font-medium" style={{ color: '#22c77e' }}>Thanks for reporting! This helps other users.</p>
        </div>
      )}

      {showReport && !submitted && (
        <div className="rounded-2xl p-4 glass-card animate-fadeUp">
          <p className="text-xs font-medium mb-3" style={{ color: '#f0f0f4' }}>Which store?</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {UK_RETAILERS.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRetailer(r)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  backgroundColor: selectedRetailer === r ? `${RETAILER_COLORS[r] || '#555'}30` : 'rgba(255,255,255,0.04)',
                  color: selectedRetailer === r ? (RETAILER_COLORS[r] || '#f0f0f4') : 'rgba(240,240,244,0.45)',
                  border: `1px solid ${selectedRetailer === r ? (RETAILER_COLORS[r] || '#555') + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {selectedRetailer && (
            <>
              <p className="text-xs font-medium mb-2" style={{ color: '#f0f0f4' }}>Price (optional)</p>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(240,240,244,0.4)' }}>£</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-xs outline-none glass-input"
                    style={{ color: '#f0f0f4' }}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ backgroundColor: 'rgba(34,199,126,0.15)', color: '#22c77e' }}
              >
                {submitting ? 'Saving...' : 'Submit'}
              </button>
            </>
          )}

          <p className="text-[11px] mt-2 text-center" style={{ color: 'rgba(240,240,244,0.3)' }}>
            Community-submitted data has not been independently verified by IngredScan.
          </p>
        </div>
      )}
    </div>
  )
}
