'use client'

import { useState } from 'react'

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
      // silently fail
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* Floating pill button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all hover:scale-105"
        style={{
          backgroundColor: 'rgba(124,111,255,0.15)',
          color: '#7c6fff',
          border: '1px solid rgba(124,111,255,0.25)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Feedback
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div
            className="relative w-full max-w-lg rounded-t-2xl p-6 animate-fadeUp glass-card"
            style={{
              backgroundColor: '#13131a',
              borderColor: 'rgba(255,255,255,0.08)',
              borderBottom: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">&#10003;</div>
                <p className="text-sm font-medium" style={{ color: '#00e5a0' }}>
                  Thanks for your feedback!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold heading-display" style={{ color: '#f0f0f4' }}>
                    Send Feedback
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'rgba(240,240,244,0.4)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
                  style={{
                    backgroundColor: '#1c1c26',
                    color: '#f0f0f4',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(124,111,255,0.4)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  required
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full mt-3 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#1c1c26',
                    color: '#f0f0f4',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(124,111,255,0.4)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />

                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-semibold btn-glow transition-all disabled:opacity-50"
                  style={{ color: '#0b0b0f' }}
                >
                  {submitting ? 'Sending...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
