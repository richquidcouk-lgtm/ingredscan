'use client'

import Link from 'next/link'

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 animate-slideUp"
        style={{ backgroundColor: '#13131a', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6 sm:hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-clash)', color: '#f0f0f4' }}>
            Scan limit reached
          </h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(240,240,244,0.45)' }}>
            Upgrade to Pro for unlimited scans, full additive detail, and UK supermarket swaps.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            'Unlimited daily scans',
            'Full additive risk ratings',
            'UK supermarket swaps',
            'Scan history',
            'AI label photo parser',
            'Shareable scan cards',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <span style={{ color: '#22c77e' }}>✓</span>
              <span className="text-sm" style={{ color: '#f0f0f4' }}>{feature}</span>
            </div>
          ))}
        </div>

        <Link
          href="/pro"
          className="block w-full py-3 rounded-xl text-sm font-medium text-center transition-opacity"
          style={{ backgroundColor: '#22c77e', color: '#0b0b0f' }}
          onClick={onClose}
        >
          View Pro Plans — from £3.99/mo
        </Link>

        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-xl text-sm transition-colors"
          style={{ color: 'rgba(240,240,244,0.45)' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
