'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isValidBarcode } from '@/lib/barcode'

// Direct html5-qrcode integration. The previous implementation wrapped the
// reusable Scanner component AND drew its own viewfinder frame, resulting in
// two sets of corner brackets and two scan lines. Now this page owns the
// camera entirely so there's exactly one overlay.
export default function ScanPage() {
  const router = useRouter()
  const qrRef = useRef<{ stop: () => Promise<void>; applyVideoConstraints?: (c: MediaTrackConstraints) => Promise<void> } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [scanned, setScanned] = useState(false)
  const [starting, setStarting] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true
    let scannerInstance: { stop: () => Promise<void> } | null = null

    async function start() {
      try {
        const mod = await import('html5-qrcode')
        if (!mounted) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Html5Qrcode = (mod as any).Html5Qrcode
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scanner = new Html5Qrcode('camera-region', { verbose: false } as any)
        qrRef.current = scanner
        scannerInstance = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
            videoConstraints: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'environment',
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          (decodedText: string) => {
            if (!isValidBarcode(decodedText)) return
            setScanned((prev) => {
              if (prev) return prev
              try { scanner.stop() } catch {}
              setTimeout(() => router.push(`/result/${decodedText}?source=scan`), 400)
              return true
            })
          },
          () => {}
        )
        if (mounted) setStarting(false)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!mounted) return
        const msg = e?.message || ''
        if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
          setError('Camera permission denied. Allow camera access in your browser settings, then reload.')
        } else {
          setError('Could not start the camera on this device.')
        }
        setStarting(false)
      }
    }

    start()
    return () => {
      mounted = false
      if (scannerInstance) {
        try { scannerInstance.stop() } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleTorch() {
    if (!qrRef.current?.applyVideoConstraints) return
    try {
      await qrRef.current.applyVideoConstraints({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        advanced: [{ torch: !torchOn } as any],
      })
      setTorchOn(!torchOn)
    } catch {
      // torch unsupported on this device — silently ignore
    }
  }

  async function handleGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      // Stop the live camera so the file scanner can take over.
      if (qrRef.current) {
        try { await qrRef.current.stop() } catch {}
      }
      const mod = await import('html5-qrcode')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Html5Qrcode = (mod as any).Html5Qrcode
      // Need a (hidden) target div for scanFile.
      let region = document.getElementById('file-scan-region')
      if (!region) {
        region = document.createElement('div')
        region.id = 'file-scan-region'
        region.style.display = 'none'
        document.body.appendChild(region)
      }
      const fileScanner = new Html5Qrcode('file-scan-region')
      const result = await fileScanner.scanFile(file, true)
      router.push(`/result/${result}?source=scan`)
    } catch {
      setError('Couldn\u2019t detect a barcode in that image. Try a clearer photo.')
    }
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const code = manualBarcode.trim()
    if (code.length >= 6 && isValidBarcode(code)) {
      router.push(`/result/${code}?source=scan`)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#000', color: '#fff' }}>
      {/* Camera viewport — html5-qrcode injects a <video> directly inside
          #camera-region. The region must have explicit dimensions so the
          library can autosize the video correctly. flex-1 + width/height
          100% gives us the available space below the bottom controls. */}
      <div className="relative flex-1 overflow-hidden">
        <div id="camera-region" style={{ width: '100%', height: '100%' }} />

        {/* Top bar */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4"
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
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
            Scan barcode
          </span>
          <button
            onClick={toggleTorch}
            type="button"
            className="rounded-full flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              border: '1px solid rgba(255,255,255,0.2)',
              background: torchOn ? 'rgba(168,213,181,0.2)' : 'rgba(0,0,0,0.3)',
              color: torchOn ? '#a8d5b5' : '#fff',
              cursor: 'pointer',
            }}
            aria-label="Toggle torch"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={torchOn ? '#a8d5b5' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        </div>

        {/* Single set of corner brackets + scan line, centred over the
            camera as an absolute overlay so the camera region itself is
            never resized by the overlay's intrinsic content. */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
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
          <div className="text-center mt-2.5" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            {starting ? 'Starting camera…' : 'Hold steady over the barcode'}
          </div>
        </div>

        {scanned && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: 'rgba(61, 140, 94, 0.18)' }}
          >
            <div className="text-6xl animate-bounce">✓</div>
          </div>
        )}

        {error && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-30"
            style={{ background: 'rgba(0,0,0,0.88)' }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Camera unavailable</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 280, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}
      </div>

      {/* Manual barcode entry */}
      <form onSubmit={submitManual} className="flex gap-2 px-5 mt-3 mb-2">
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

      {/* Bottom controls — gallery, search, torch */}
      <div
        className="flex gap-3 items-center px-5 pt-3"
        style={{
          background: '#111',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGallery}
          className="hidden"
        />
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
          onClick={toggleTorch}
          className="flex items-center justify-center gap-1.5"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: torchOn ? 'rgba(168,213,181,0.18)' : 'transparent',
            color: torchOn ? '#a8d5b5' : '#fff',
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
