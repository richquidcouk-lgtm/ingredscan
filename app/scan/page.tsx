'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Logo from '@/components/Logo'

// Scan page is now camera-only. Manual product lookup lives on /search —
// keeping the two flows separate avoids the confusing double-surface UI
// where both tabs opened the same page with a search bar AND a scanner.
const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false })

export default function ScanPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto relative z-10">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl glass-card"
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <Logo size="small" />
        <div className="w-10" />
      </header>

      {/* Scanner */}
      <div className="px-5 mt-2 max-w-lg mx-auto animate-fadeUp relative z-10">
        <div className="rounded-2xl overflow-hidden glass-card p-1">
          <Scanner />
        </div>
      </div>

      {/* Tip + escape hatch to manual search */}
      <div
        className="px-5 mt-6 max-w-lg mx-auto animate-fadeUp relative z-10"
        style={{ animationDelay: '100ms' }}
      >
        <p className="text-xs text-center mb-4" style={{ color: 'rgba(244,241,248,0.5)' }}>
          Point your camera at a product barcode. Works for food and beauty.
        </p>
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl glass-card text-sm font-semibold"
          style={{
            color: '#f4f1f8',
            border: '1px solid rgba(124,111,255,0.25)',
            background: 'linear-gradient(135deg, rgba(124,111,255,0.1), rgba(0,229,160,0.05))',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Can&apos;t scan? Search products instead
        </Link>
      </div>
    </div>
  )
}
