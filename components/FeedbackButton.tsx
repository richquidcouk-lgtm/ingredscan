'use client'

import { useState } from 'react'

// Cream-theme floating feedback button + modal. Sits above the bottom nav.
export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || null,
          page: window.location.pathname,
        }),
      })
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
        setMessage('')
        setEmail('')
      }, 1800)
    } catch {
      alert('Failed to send feedback. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* Floating icon button */}
      <button
        onClick={() => setOpen(true)}
        type="button"
        aria-label="Send feedback"
        className="fixed z-30 flex items-center justify-center rounded-full transition-all"
        style={{
          width: 40,
          height: 40,
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 16,
          background: 'var(--card)',
          color: 'var(--green)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 16px rgba(28, 27, 24, 0.12)',
          opacity: 0.85,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(28, 27, 24, 0.5)', backdropFilter: 'blur(6px)' }}
          />
          <div
            className="relative animate-fadeUp w-full sm:max-w-[400px]"
            style={{
              background: 'var(--card)',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              border: '1px solid var(--border)',
              padding: 24,
              paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <p className="heading-display" style={{ fontSize: 16, color: 'var(--green-deep)' }}>
                  Thanks for your feedback!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="heading-display" style={{ fontSize: 18 }}>
                    Send feedback
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                    }}
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  required
                  className="w-full outline-none resize-none"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--cream)',
                    color: 'var(--dark)',
                    fontFamily: 'var(--font-body), DM Sans, sans-serif',
                    fontSize: 14,
                  }}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full outline-none mt-3"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--cream)',
                    color: 'var(--dark)',
                    fontFamily: 'var(--font-body), DM Sans, sans-serif',
                    fontSize: 14,
                  }}
                />

                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="btn-primary mt-4"
                  style={{ opacity: submitting || !message.trim() ? 0.5 : 1 }}
                >
                  {submitting ? 'Sending…' : 'Submit feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
