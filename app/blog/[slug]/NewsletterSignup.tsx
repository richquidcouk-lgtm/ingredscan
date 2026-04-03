'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog' }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('You\'re subscribed! Check your inbox.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div
      className="rounded-2xl p-6 mb-12"
      style={{
        backgroundColor: 'rgba(19,19,26,0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3 className="text-base font-bold heading-display mb-1" style={{ color: '#f0f0f4' }}>
        Get our weekly food scan report
      </h3>
      <p className="text-xs mb-4" style={{ color: 'rgba(240,240,244,0.4)' }}>
        No spam. Unsubscribe anytime.
      </p>

      {status === 'success' ? (
        <p className="text-sm font-medium" style={{ color: '#00e5a0' }}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2.5 rounded-xl text-sm glass-input outline-none"
            style={{ color: '#f0f0f4' }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: '#00e5a0', color: '#0b0b0f' }}
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-xs mt-2" style={{ color: '#ff5a5a' }}>{message}</p>
      )}
    </div>
  )
}
