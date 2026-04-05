'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Preload the library as soon as this module is imported
const html5QrcodePromise = typeof window !== 'undefined'
  ? import('html5-qrcode')
  : null

export default function Scanner() {
  const router = useRouter()
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const onScanSuccess = useCallback((decodedText: string) => {
    if (scanSuccess) return
    setScanSuccess(true)

    if (html5QrCodeRef.current) {
      try { html5QrCodeRef.current.stop() } catch {}
    }

    setTimeout(() => {
      router.push(`/result/${decodedText}?source=scan`)
    }, 600)
  }, [router, scanSuccess])

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState?.()
        if (state === 2) { // SCANNING
          await html5QrCodeRef.current.stop()
        }
      } catch {}
      html5QrCodeRef.current = null
    }
  }, [])

  const startScanner = useCallback(async () => {
    try {
      // Stop any existing scanner first
      await stopScanner()

      const { Html5Qrcode } = html5QrcodePromise ? await html5QrcodePromise : await import('html5-qrcode')

      if (!scannerRef.current) return

      // Clear the scanner region in case of leftover DOM elements
      const region = document.getElementById('scanner-region')
      if (region) region.innerHTML = ''

      const scanner = new Html5Qrcode('scanner-region', {
        formatsToSupport: [0, 1, 2, 3], // EAN_13, EAN_8, UPC_A, UPC_E
        verbose: false,
      } as any)
      html5QrCodeRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'environment',
          },
        } as any,
        onScanSuccess,
        () => {}
      )

      setIsStarted(true)
      setError(null)
    } catch (err: any) {
      if (err?.message?.includes('Permission')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else {
        setError('Could not start camera. Please ensure your device has a camera.')
      }
    }
  }, [onScanSuccess, stopScanner])

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!mounted) return
      await startScanner()
    }

    init()

    return () => {
      mounted = false
      stopScanner()
    }
  }, [startScanner, stopScanner])

  const handleRetry = async () => {
    setError(null)
    setIsStarted(false)
    setRetryCount(r => r + 1)

    // Release all camera streams before retrying
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      if (videoDevices.length > 0) {
        // Get and immediately stop a stream to force-release the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        stream.getTracks().forEach(track => track.stop())
      }
    } catch {}

    // Small delay to let the camera fully release
    await new Promise(resolve => setTimeout(resolve, 500))
    await startScanner()
  }

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
        <h2 className="text-lg font-bold mb-2" style={{ color: '#f0f0f4', fontFamily: 'var(--font-display)' }}>
          Camera Access Needed
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,240,244,0.45)' }}>
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#00e5a0', color: '#0b0b0f' }}
        >
          Try Again
        </button>
        {retryCount > 0 && (
          <p className="text-xs mt-4 max-w-xs" style={{ color: 'rgba(240,240,244,0.3)' }}>
            Still not working? Try closing other apps that use the camera, or upload a photo of the barcode below.
          </p>
        )}
        <div id="file-scanner" className="hidden" />
        <label className="flex items-center justify-center gap-2 mt-4 py-3 px-6 rounded-xl cursor-pointer transition-colors"
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

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Scanner viewport */}
      <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#000' }}>
        <div id="scanner-region" ref={scannerRef} className="w-full" />
        <div id="file-scanner" className="hidden" />

        {/* Success flash */}
        {scanSuccess && (
          <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,229,160,0.15)' }}>
            <div className="text-6xl animate-bounce">✓</div>
          </div>
        )}

        {/* Animated corners */}
        {isStarted && !scanSuccess && (
          <>
            <div className="absolute top-[15%] left-[10%] w-8 h-8 border-t-2 border-l-2 rounded-tl-lg animate-pulse" style={{ borderColor: '#00e5a0' }} />
            <div className="absolute top-[15%] right-[10%] w-8 h-8 border-t-2 border-r-2 rounded-tr-lg animate-pulse" style={{ borderColor: '#00e5a0' }} />
            <div className="absolute bottom-[15%] left-[10%] w-8 h-8 border-b-2 border-l-2 rounded-bl-lg animate-pulse" style={{ borderColor: '#00e5a0' }} />
            <div className="absolute bottom-[15%] right-[10%] w-8 h-8 border-b-2 border-r-2 rounded-br-lg animate-pulse" style={{ borderColor: '#00e5a0' }} />
            {/* Scan line */}
            <div
              className="absolute left-[10%] right-[10%] h-0.5"
              style={{
                backgroundColor: '#00e5a0',
                boxShadow: '0 0 8px #00e5a0',
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
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#00e5a0', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>Starting camera...</p>
            </div>
          </div>
        )}

        {/* Torch button */}
        {isStarted && (
          <button
            onClick={toggleTorch}
            aria-label="Toggle flashlight"
            className="absolute top-4 right-4 z-10 p-2.5 rounded-xl backdrop-blur-md"
            style={{ backgroundColor: torchOn ? '#00e5a030' : 'rgba(0,0,0,0.5)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={torchOn ? '#00e5a0' : 'none'} stroke={torchOn ? '#00e5a0' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
            </svg>
          </button>
        )}

        {/* Restart camera button */}
        {isStarted && !scanSuccess && (
          <button
            onClick={handleRetry}
            aria-label="Restart camera"
            className="absolute top-4 left-4 z-10 p-2.5 rounded-xl backdrop-blur-md"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
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
