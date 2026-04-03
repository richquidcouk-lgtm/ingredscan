'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function Scanner() {
  const router = useRouter()
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)

  const onScanSuccess = useCallback((decodedText: string) => {
    if (scanSuccess) return
    setScanSuccess(true)

    if (html5QrCodeRef.current) {
      try { html5QrCodeRef.current.stop() } catch {}
    }

    setTimeout(() => {
      router.push(`/result/${decodedText}`)
    }, 600)
  }, [router, scanSuccess])

  useEffect(() => {
    let mounted = true

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')

        if (!mounted || !scannerRef.current) return

        const scanner = new Html5Qrcode('scanner-region')
        html5QrCodeRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.0,
          },
          onScanSuccess,
          () => {}
        )

        if (mounted) setIsStarted(true)
      } catch (err: any) {
        if (mounted) {
          if (err?.message?.includes('Permission')) {
            setError('Camera permission denied. Please allow camera access in your browser settings.')
          } else {
            setError('Could not start camera. Please ensure your device has a camera.')
          }
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (html5QrCodeRef.current) {
        try { html5QrCodeRef.current.stop() } catch {}
      }
    }
  }, [onScanSuccess])

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current) return
    try {
      const track = html5QrCodeRef.current.getRunningTrackSettings?.()
      if (track) {
        const newTorch = !torchOn
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: newTorch } as any],
        })
        setTorchOn(newTorch)
      }
    } catch {}
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('file-scanner')
      const result = await scanner.scanFile(file, true)
      onScanSuccess(result)
    } catch {
      setError('Could not detect a barcode in the image. Please try again.')
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4">📷</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#f0f0f4', fontFamily: 'var(--font-clash)' }}>
          Camera Access Needed
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
          {error}
        </p>
        <button
          onClick={() => { setError(null); window.location.reload() }}
          className="px-6 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#22c77e', color: '#0b0b0f' }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Scanner viewport */}
      <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#000' }}>
        <div id="scanner-region" ref={scannerRef} className="w-full" />
        <div id="file-scanner" className="hidden" />

        {/* Success flash */}
        {scanSuccess && (
          <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(34,199,126,0.15)' }}>
            <div className="text-6xl animate-bounce">✓</div>
          </div>
        )}

        {/* Animated corners */}
        {isStarted && !scanSuccess && (
          <>
            <div className="absolute top-[15%] left-[10%] w-8 h-8 border-t-2 border-l-2 rounded-tl-lg animate-pulse" style={{ borderColor: '#22c77e' }} />
            <div className="absolute top-[15%] right-[10%] w-8 h-8 border-t-2 border-r-2 rounded-tr-lg animate-pulse" style={{ borderColor: '#22c77e' }} />
            <div className="absolute bottom-[15%] left-[10%] w-8 h-8 border-b-2 border-l-2 rounded-bl-lg animate-pulse" style={{ borderColor: '#22c77e' }} />
            <div className="absolute bottom-[15%] right-[10%] w-8 h-8 border-b-2 border-r-2 rounded-br-lg animate-pulse" style={{ borderColor: '#22c77e' }} />
            {/* Scan line */}
            <div
              className="absolute left-[10%] right-[10%] h-0.5"
              style={{
                backgroundColor: '#22c77e',
                boxShadow: '0 0 8px #22c77e',
                animation: 'scanLine 2s ease-in-out infinite alternate',
                top: '20%',
              }}
            />
          </>
        )}

        {/* Loading state */}
        {!isStarted && (
          <div className="flex items-center justify-center" style={{ minHeight: 300, backgroundColor: '#0b0b0f' }}>
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#22c77e', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>Starting camera...</p>
            </div>
          </div>
        )}

        {/* Torch button */}
        {isStarted && (
          <button
            onClick={toggleTorch}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-xl backdrop-blur-md"
            style={{ backgroundColor: torchOn ? '#22c77e30' : 'rgba(0,0,0,0.5)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={torchOn ? '#22c77e' : '#fff'} strokeWidth="2">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
            💡
          </button>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm mt-4" style={{ color: 'rgba(240,240,244,0.45)' }}>
        Point at any barcode
      </p>

      {/* Upload fallback */}
      <label className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl cursor-pointer transition-colors"
        style={{ backgroundColor: '#1c1c26', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.45)" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>Upload from gallery</span>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </label>
    </div>
  )
}
