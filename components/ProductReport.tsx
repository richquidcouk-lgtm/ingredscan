'use client'

import { useState } from 'react'

const ISSUE_TYPES = [
  'Wrong product name',
  'Incorrect ingredients',
  'Wrong score',
  'Missing information',
  'Other',
]

export default function ProductReport({ barcode }: { barcode: string }) {
  const [open, setOpen] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!issueType) return
    setSubmitting(true)

    try {
      await fetch('/api/feedback/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          issue_type: issueType,
          description: description.trim() || null,
        }),
      })
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
        setIssueType('')
        setDescription('')
      }, 1800)
    } catch {
      alert('Failed to submit report. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      <div className="text-center animate-fadeUp" style={{ animationDelay: '110ms' }}>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'rgba(255,90,90,0.08)',
            color: '#ff5a5a',
            border: '1px solid rgba(255,90,90,0.15)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Report an issue
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <div
            className="relative rounded-2xl p-6 animate-fadeUp glass-card mx-4"
            style={{
              width: 'calc(100% - 32px)',
              maxWidth: '400px',
              backgroundColor: '#13131a',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">&#10003;</div>
                <p className="text-sm font-medium" style={{ color: '#00e5a0' }}>
                  Report submitted. Thank you!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold heading-display" style={{ color: '#f0f0f4' }}>
                    Report an Issue
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

                <div className="space-y-2 mb-4">
                  {ISSUE_TYPES.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        backgroundColor: issueType === type ? 'rgba(124,111,255,0.1)' : '#1c1c26',
                        border: `1px solid ${issueType === type ? 'rgba(124,111,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <input
                        type="radio"
                        name="issue_type"
                        value={type}
                        checked={issueType === type}
                        onChange={() => setIssueType(type)}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{
                          borderColor: issueType === type ? '#7c6fff' : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        {issueType === type && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7c6fff' }} />
                        )}
                      </div>
                      <span className="text-sm" style={{ color: '#f0f0f4' }}>{type}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
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
                  disabled={submitting || !issueType}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-semibold btn-glow transition-all disabled:opacity-50"
                  style={{ color: '#0b0b0f' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
