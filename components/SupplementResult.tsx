'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/supabase'
import ProductReport from './ProductReport'
import Logo from './Logo'

interface Props {
  product: Product
  onBack: () => void
}

export default function SupplementResult({ product, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleNotify() {
    if (!email || !email.includes('@')) return
    setSubmitting(true)
    try {
      await fetch('/api/supplement-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product_name: product.name, barcode: product.barcode }),
      })
      setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen pb-28 relative">
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 max-w-lg mx-auto"
        style={{ background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <button onClick={onBack} className="p-2 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <Logo size="small" />
        <div className="w-10" />
      </header>

      <div className="px-5 max-w-lg mx-auto space-y-4 relative z-10">
        {/* Product card */}
        <div className="rounded-2xl p-5 animate-fadeUp glass-card">
          <div className="flex items-start gap-4">
            {product.image_url ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: '#1c1c26' }}>
                <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                💊
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold leading-tight heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
                {product.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>{product.brand}</p>
            </div>
          </div>
        </div>

        {/* Not supported banner */}
        <div className="rounded-2xl p-5 animate-fadeUp" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: '50ms' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">💊</span>
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#f0f0f4' }}>Dietary Supplement</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.55)' }}>
                IngredScan doesn&apos;t currently score dietary supplements, vitamins, or sports nutrition products. Our food and cosmetics scoring system isn&apos;t designed for these product types.
              </p>
            </div>
          </div>
        </div>

        {/* Coming soon / notify */}
        <div className="rounded-2xl p-5 glass-card animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#f0f0f4' }}>Coming Soon</h3>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(240,240,244,0.55)' }}>
            Supplement scanning is on our roadmap. We plan to add supplement ingredient analysis in a future update.
          </p>
          {submitted ? (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(34,199,126,0.08)', border: '1px solid rgba(34,199,126,0.12)' }}>
              <p className="text-xs font-medium" style={{ color: '#22c77e' }}>We&apos;ll notify you when supplement scanning launches.</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none glass-input"
                style={{ color: '#f0f0f4' }}
              />
              <button
                onClick={handleNotify}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs font-medium shrink-0"
                style={{ backgroundColor: 'rgba(124,111,255,0.15)', color: '#7c6fff' }}
              >
                {submitting ? '...' : 'Notify me'}
              </button>
            </div>
          )}
        </div>

        {/* Helpful links */}
        <div className="space-y-2 animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(240,240,244,0.4)' }}>For supplement information we recommend:</p>
          <a href="https://examine.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl p-4 glass-card transition-all active:scale-[0.98]">
            <span className="text-xl">🔍</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>Examine.com — Supplement Research</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.35)' }}>examine.com</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
          <a href="https://www.nhs.uk/conditions/vitamins-and-minerals/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl p-4 glass-card transition-all active:scale-[0.98]">
            <span className="text-xl">🏥</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>NHS Vitamins &amp; Supplements</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.35)' }}>nhs.uk</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
        </div>

        {/* Report */}
        <div className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-center mb-2" style={{ color: 'rgba(240,240,244,0.25)' }}>
            If you think this product was incorrectly identified, let us know.
          </p>
          <ProductReport barcode={product.barcode} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-lg mx-auto px-5 py-3">
          <Link href="/scan" className="block w-full text-center py-3.5 rounded-xl text-sm font-semibold btn-glow transition-all" style={{ color: '#0b0b0f' }}>
            Scan Another Product
          </Link>
        </div>
      </div>
    </div>
  )
}
