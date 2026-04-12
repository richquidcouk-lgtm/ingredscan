'use client'

import { useRef, useState } from 'react'

type Step = 1 | 2 | 3
type Photos = { front: string | null; ingredients: string | null; nutrition: string | null }

const STEPS: Array<{ step: Step; key: keyof Photos; label: string; icon: string }> = [
  { step: 1, key: 'front', label: 'Front of product', icon: '📦' },
  { step: 2, key: 'ingredients', label: 'Ingredients list', icon: '📋' },
  { step: 3, key: 'nutrition', label: 'Nutrition label', icon: '🔢' },
]

function resizeImage(file: File, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface Props {
  barcode: string
  onProductFound: (product: Record<string, unknown>) => void
}

export default function PhotoSubmission({ barcode, onProductFound }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [photos, setPhotos] = useState<Photos>({ front: null, ingredients: null, nutrition: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const resized = await resizeImage(file)
      const stepInfo = STEPS[currentStep - 1]
      setPhotos((prev) => ({ ...prev, [stepInfo.key]: resized }))
      if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as Step)
      }
    } catch {
      setError('Failed to process image. Try again.')
    }
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!photos.front || !photos.ingredients || !photos.nutrition) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/scan/submit-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, photos }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed')
      }
      const product = await res.json()
      onProductFound(product)
    } catch (err) {
      setError((err as Error).message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  const allCaptured = photos.front && photos.ingredients && photos.nutrition

  if (submitting) {
    return (
      <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center animate-fadeIn">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <div className="heading-display" style={{ fontSize: 18, marginBottom: 8 }}>
          Analysing product...
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
          AI is reading the labels and computing a quality score. This takes a few seconds.
        </p>
        <div
          className="mt-6 mx-auto"
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--green)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto pt-16 pb-24 px-5 animate-fadeIn">
      <div className="text-center mb-8">
        <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
        <h2 className="heading-display" style={{ fontSize: 20, marginBottom: 6 }}>
          Product not in our database
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 320, margin: '0 auto' }}>
          Help us add it! Take three photos and we&apos;ll analyse the product instantly using AI.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {STEPS.map(({ step, label, icon, key }) => {
          const done = !!photos[key]
          const active = step === currentStep
          return (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className="flex-1 text-center py-3 rounded-xl transition-all"
              style={{
                background: done ? 'var(--green-bg)' : active ? 'var(--card)' : 'var(--soft)',
                border: `1.5px solid ${done ? 'rgba(61,140,94,0.3)' : active ? 'var(--dark)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 2 }}>
                {done ? '✅' : icon}
              </div>
              <div style={{ fontSize: 10, color: done ? 'var(--green-deep)' : 'var(--muted)', fontWeight: 500 }}>
                {label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Current step capture */}
      <div
        className="card text-center"
        style={{ padding: 24, marginBottom: 16 }}
      >
        {photos[STEPS[currentStep - 1].key] ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[STEPS[currentStep - 1].key]!}
              alt={STEPS[currentStep - 1].label}
              style={{ maxHeight: 200, borderRadius: 12, margin: '0 auto 12px', objectFit: 'contain' }}
            />
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500, marginBottom: 8 }}>
              Photo captured
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Retake
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.4 }}>
              {STEPS[currentStep - 1].icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              {STEPS[currentStep - 1].label}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
              Take a clear, well-lit photo
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="btn-primary"
              style={{ maxWidth: 220, margin: '0 auto' }}
            >
              Take photo
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl"
          style={{
            padding: '10px 14px',
            background: 'var(--red-bg)',
            color: 'var(--red-deep)',
            fontSize: 12,
            border: '1px solid rgba(192,57,43,0.2)',
          }}
        >
          {error}
        </div>
      )}

      {allCaptured && (
        <button
          onClick={handleSubmit}
          className="btn-primary"
          style={{ marginTop: 8 }}
        >
          Analyse product
        </button>
      )}
    </div>
  )
}
