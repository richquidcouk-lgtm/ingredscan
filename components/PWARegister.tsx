'use client'

import { useEffect, useState, useRef } from 'react'

const INSTALL_DISMISSED_KEY = 'ingredscan_install_dismissed'
const INSTALL_DONE_KEY = 'ingredscan_installed'

export default function PWARegister() {
  const [showInstall, setShowInstall] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const deferredPromptRef = useRef<any>(null)
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)

  useEffect(() => {
    // Register service worker
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then(registration => {
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            waitingWorkerRef.current = newWorker
            setShowUpdate(true)
          }
        })
      })
    }).catch(() => {})

    // Capture the install prompt
    const handlePrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e

      // Don't show if already installed or recently dismissed
      const isInstalled = localStorage.getItem(INSTALL_DONE_KEY) === 'true'
      const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY)
      if (isInstalled) return

      // If dismissed, wait 3 days before showing again
      if (dismissed) {
        const dismissedDate = new Date(dismissed)
        const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 3) return
      }

      // Show after a short delay so it doesn't flash immediately
      setTimeout(() => setShowInstall(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)

    // iOS detection — show install banner with Safari instructions
    const ua = navigator.userAgent
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (isiOS && !window.matchMedia('(display-mode: standalone)').matches) {
      const isInstalled = localStorage.getItem(INSTALL_DONE_KEY) === 'true'
      const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY)
      if (!isInstalled) {
        if (!dismissed || (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24) >= 3) {
          setTimeout(() => setShowInstall(true), 2000)
        }
      }
    }

    // Detect if already installed
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALL_DONE_KEY, 'true')
      setShowInstall(false)
      deferredPromptRef.current = null
    })

    // Check if running as standalone (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem(INSTALL_DONE_KEY, 'true')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
    }
  }, [])

  async function handleInstall() {
    const prompt = deferredPromptRef.current
    if (!prompt) return

    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      localStorage.setItem(INSTALL_DONE_KEY, 'true')
    }
    deferredPromptRef.current = null
    setShowInstall(false)
  }

  function handleDismiss() {
    localStorage.setItem(INSTALL_DISMISSED_KEY, new Date().toISOString())
    setShowInstall(false)
  }

  function handleUpdate() {
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' })
    }
    window.location.reload()
  }

  return (
    <>
      {/* Install Banner — prominent, full-width, shown at bottom above nav */}
      {showInstall && (
        <div
          className="fixed bottom-16 left-0 right-0 z-50 px-4 pb-2 animate-fadeUp"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <div
            className="max-w-lg mx-auto rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(19,19,26,0.98) 0%, rgba(124,111,255,0.08) 100%)',
              border: '1px solid rgba(124,111,255,0.2)',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 30px rgba(124,111,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.4)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="flex items-start gap-4">
              {/* App icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #00e5a0, #1ab06e)',
                  boxShadow: '0 4px 15px rgba(0,229,160,0.25)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold mb-1" style={{ color: '#f0f0f4' }}>
                  Install IngredScan
                </h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(240,240,244,0.5)' }}>
                  Add to your home screen for instant access. Works just like any other app — no app store needed, no storage used.
                </p>

                {deferredPromptRef.current ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInstall}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #00e5a0, #1ab06e)',
                        color: '#0b0b0f',
                        boxShadow: '0 2px 12px rgba(0,229,160,0.3)',
                      }}
                    >
                      Install App
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2.5 rounded-xl text-sm transition-all"
                      style={{ color: 'rgba(240,240,244,0.4)' }}
                    >
                      Later
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(240,240,244,0.6)' }}>
                      Tap <span style={{ color: '#007AFF', fontWeight: 600 }}>Share</span> ↗ at the bottom of Safari, then tap <strong>&quot;Add to Home Screen&quot;</strong>
                    </p>
                    <button
                      onClick={handleDismiss}
                      className="text-xs"
                      style={{ color: 'rgba(240,240,244,0.4)' }}
                    >
                      Got it
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c77e" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
                    <span className="text-[11px]" style={{ color: 'rgba(240,240,244,0.5)' }}>Instant access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c77e" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
                    <span className="text-[11px]" style={{ color: 'rgba(240,240,244,0.5)' }}>Works offline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c77e" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
                    <span className="text-[11px]" style={{ color: 'rgba(240,240,244,0.5)' }}>Always up to date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Banner — shown when new version is available */}
      {showUpdate && (
        <div
          className="fixed top-0 left-0 right-0 z-50 px-4 pt-2 animate-fadeUp"
          style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}
        >
          <div
            className="max-w-lg mx-auto rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{
              background: 'rgba(19,19,26,0.98)',
              border: '1px solid rgba(0,229,160,0.2)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,229,160,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: '#f0f0f4' }}>Update available</p>
              <p className="text-[11px]" style={{ color: 'rgba(240,240,244,0.4)' }}>Tap to get the latest version</p>
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95"
              style={{ backgroundColor: 'rgba(0,229,160,0.15)', color: '#00e5a0' }}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  )
}
