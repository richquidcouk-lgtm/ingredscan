'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false })

// Full-screen black viewfinder with corner brackets and a sweeping scan line.
// Manual barcode entry below the camera, plus gallery / torch controls.
export default function ScanPage() {
  const router = useRouter()
  const [manualBarcode, setManualBarcode] = useState('')

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const code = manualBarcode.trim()
    if (code.length >= 6) {
      router.push(`/result/${code}?source=scan`)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#000', color: '#fff' }}>
      {/* Viewfinder */}
      <div
        className="relative flex-1 overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #0a0a0a, #111)' }}
      >
        {/* Underlying html5-qrcode video */}
        <div className="absolute inset-0 opacity-90">
          <Scanner />
        </div>

        {/* Top nav (overlay) */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}
        >
          <button
            onClick={() => router.back()}
            type="button"
            className="rounded-full flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              cursor: 'pointer',
            }}
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500 }}>
            Scan barcode
          </span>
          <button
            type="button"
            className="rounded-full flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              cursor: 'pointer',
            }}
            aria-label="Toggle torch"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        </div>

        {/* Frame + scanning line */}
        <div className="relative z-10 pointer-events-none">
          <div style={{ width: 240, height: 240, position: 'relative' }}>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <div
              style={{
                position: 'absolute',
                left: 4,
                right: 4,
                height: 2,
                background: 'linear-gradient(to right, transparent, #3d8c5e, transparent)',
                boxShadow: '0 0 8px #3d8c5e',
                animation: 'scanLine 2s ease-in-out infinite',
              }}
            />
          </div>
          <div className="text-center mt-2.5" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            Hold steady over the barcode
          </div>
        </div>
      </div>

      {/* Manual barcode entry */}
      <form onSubmit={submitManual} className="flex gap-2 px-5 mb-3 mt-3">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Or type barcode manually…"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value.replace(/[^0-9]/g, ''))}
          className="flex-1 outline-none"
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          aria-label="Open barcode"
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: '#3d8c5e',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          →
        </button>
      </form>

      {/* Gallery / search bar */}
      <div
        className="flex gap-3 items-center px-5 pt-4"
        style={{
          background: '#111',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          type="button"
          className="flex items-center justify-center gap-1.5"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <span>🖼</span> Gallery
        </button>
        <Link
          href="/search"
          className="flex items-center justify-center"
          style={{
            flex: 2,
            padding: 15,
            borderRadius: 12,
            background: '#3d8c5e',
            color: '#fff',
            fontSize: 15,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Search products instead →
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <span>💡</span> Torch
        </button>
      </div>
    </div>
  )
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderWidth: '3px 0 0 3px', borderRadius: '4px 0 0 4px' },
    tr: { top: 0, right: 0, borderWidth: '3px 3px 0 0', borderRadius: '0 4px 0 0' },
    bl: { bottom: 0, left: 0, borderWidth: '0 0 3px 3px', borderRadius: '0 0 0 4px' },
    br: { bottom: 0, right: 0, borderWidth: '0 3px 3px 0', borderRadius: '0 0 4px 0' },
  }
  return (
    <div
      style={{
        position: 'absolute',
        width: 28,
        height: 28,
        borderColor: '#fff',
        borderStyle: 'solid',
        ...styles[pos],
      }}
    />
  )
}
