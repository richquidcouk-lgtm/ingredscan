'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Cream-theme sign-in sheet. Mirrors the visual language of /onboarding —
// dark hero block at the top with the icon tile, then a light card with
// the email + Google sign-in actions on the cream background.
export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(28, 27, 24, 0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Sign in to IngredScan"
        className="relative animate-fadeUp w-full sm:max-w-[400px]"
        style={{
          background: 'var(--card)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        {/* Dark hero strip */}
        <div
          className="relative px-6 pt-8 pb-7 text-center"
          style={{ background: 'var(--dark)', color: '#fff', overflow: 'hidden' }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(61, 140, 94, 0.18)',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(200, 118, 58, 0.12)',
            }}
          />
          {/* Close */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="absolute top-3 right-3 rounded-full flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            className="flex items-center justify-center mx-auto mb-4 relative"
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: 28,
            }}
          >
            🔍
          </div>
          <h2 className="heading-display relative" style={{ fontSize: 26, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 6 }}>
            Sign in to <em style={{ color: '#a8d5b5' }}>IngredScan</em>
          </h2>
          <p className="relative" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 260, margin: '0 auto', lineHeight: 1.5 }}>
            Save your scans, unlock history, and get smarter swap suggestions.
          </p>
        </div>

        {/* Form area */}
        <div className="px-6 pt-5" style={{ paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}>
          {sent ? (
            <div className="text-center py-6">
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <p className="heading-display" style={{ fontSize: 18, marginBottom: 6 }}>
                Check your email
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                We sent a magic link to{' '}
                <strong style={{ color: 'var(--dark)', fontWeight: 500 }}>{email}</strong>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleMagicLink}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full outline-none mb-3"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--cream)',
                    color: 'var(--dark)',
                    fontFamily: 'var(--font-body), DM Sans, sans-serif',
                    fontSize: 14,
                  }}
                />
                {error && (
                  <p className="mb-3" style={{ fontSize: 12, color: 'var(--red)' }}>
                    {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  or
                </span>
                <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
              </div>

              <button
                onClick={handleGoogle}
                type="button"
                className="w-full flex items-center justify-center gap-2.5"
                style={{
                  padding: '13px',
                  borderRadius: 14,
                  border: '1.5px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--dark)',
                  fontFamily: 'var(--font-body), DM Sans, sans-serif',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center mt-5" style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                By continuing you agree to our Terms &amp; Privacy Policy.
                <br />
                We never sell your data.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
