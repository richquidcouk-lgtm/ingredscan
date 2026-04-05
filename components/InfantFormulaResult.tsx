'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/supabase'
import Logo from './Logo'

interface Props {
  product: Product
  onBack: () => void
}

export default function InfantFormulaResult({ product, onBack }: Props) {
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
                👶
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

        {/* Guidance banner */}
        <div className="rounded-2xl p-5 animate-fadeUp" style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', animationDelay: '50ms' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">👶</span>
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#3b82f6' }}>Infant Formula Detected</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.55)' }}>
                IngredScan does not score infant formula or baby milk products. These are regulated nutritional products governed by strict EU and UK safety standards — standard food processing scores don&apos;t apply and could be misleading.
              </p>
            </div>
          </div>
        </div>

        {/* Guidance section */}
        <div className="rounded-2xl p-5 glass-card animate-fadeUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f0f0f4' }}>Choosing Infant Formula</h3>
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(240,240,244,0.55)' }}>
            All infant formulas sold in the UK must meet strict nutritional standards set by UK and EU law. They are regulated as a category, not as individual products — which means the choice between brands is less important than following proper preparation guidance.
          </p>
          <div className="space-y-2.5">
            {[
              'All UK infant formulas meet the same minimum nutritional standards',
              'The NHS recommends first infant formula (first milk) for babies from birth',
              'Follow-on milks are not necessary — first milk can be used up to 12 months',
              'Toddler milks are not recommended by the NHS — they are not nutritionally superior to a balanced diet',
            ].map(point => (
              <div key={point} className="flex items-start gap-2">
                <span className="text-xs mt-0.5" style={{ color: '#22c77e' }}>✓</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.55)' }}>{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Official guidance links */}
        <div className="space-y-2 animate-fadeUp" style={{ animationDelay: '150ms' }}>
          <a
            href="https://www.nhs.uk/conditions/baby/breastfeeding-and-bottle-feeding/bottle-feeding/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl p-4 glass-card transition-all active:scale-[0.98]"
          >
            <span className="text-xl">🏥</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>NHS Infant Feeding Guidance</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.35)' }}>nhs.uk</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
          <a
            href="https://www.nhs.uk/start4life/feeding/bottle-feeding/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl p-4 glass-card transition-all active:scale-[0.98]"
          >
            <span className="text-xl">👶</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>Start4Life Formula Guide</p>
              <p className="text-xs" style={{ color: 'rgba(240,240,244,0.35)' }}>nhs.uk/start4life</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.3)" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center leading-relaxed animate-fadeUp" style={{ color: 'rgba(240,240,244,0.25)', animationDelay: '200ms' }}>
          If you have concerns about your baby&apos;s feeding or nutrition, please speak with your health visitor, midwife, or GP. Do not change your baby&apos;s formula without medical advice.
        </p>
      </div>

      {/* Sticky bottom */}
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
