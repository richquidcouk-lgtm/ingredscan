'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Product, type NutritionData, type AdditiveEntry } from '@/lib/supabase'
import { calculateCosmeticScore } from '@/lib/cosmeticScoring'
import { resolveAdditives, calculateQualityBreakdown, getDisplayScore, getScoreClass } from '@/lib/scoring'
import { detectSpecialCategory } from '@/lib/specialCategories'
import { getCategoryEmoji, incrementAnonScanCount } from '@/lib/utils'
import { cacheProductOffline, getOfflineProduct } from '@/lib/offlineCache'
import CosmeticResult from '@/components/CosmeticResult'
import InfantFormulaResult from '@/components/InfantFormulaResult'
import MedicineResult from '@/components/MedicineResult'
import SupplementResult from '@/components/SupplementResult'
import FavouriteButton from '@/components/FavouriteButton'

type ResolvedAdditive = ReturnType<typeof resolveAdditives>[number]

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const barcode = params.barcode as string
  const isNewScan = searchParams.get('source') === 'scan'
  const hasRecorded = useRef(false)

  const [product, setProduct] = useState<Product | null>(null)
  const [cosmeticScore, setCosmeticScore] = useState<ReturnType<typeof calculateCosmeticScore> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openAdditive, setOpenAdditive] = useState<string | null>(null)

  useEffect(() => {
    if (!barcode) return
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode])

  async function fetchProduct() {
    setLoading(true)
    setError(null)

    // Try Supabase cache first
    try {
      const { data: cached } = await supabase.from('products').select('*').eq('barcode', barcode).single()
      if (cached) {
        setProduct(cached as Product)
        cacheProductOffline(cached)
        if (cached.product_type === 'cosmetic' && cached.inci_ingredients) {
          setCosmeticScore(calculateCosmeticScore(cached, cached.inci_ingredients))
        }
        setLoading(false)
        recordScan()
        return
      }
    } catch {
      // not cached
    }

    try {
      const res = await fetch(`/api/scan?barcode=${barcode}`)
      if (!res.ok) {
        const offline = getOfflineProduct(barcode)
        if (offline) {
          setProduct(offline as Product)
          setLoading(false)
          return
        }
        setError(res.status === 404 ? 'not_found' : 'api_error')
        setLoading(false)
        return
      }
      const data = await res.json()
      setProduct(data as Product)
      cacheProductOffline(data)
      recordScan()
    } catch {
      const offline = getOfflineProduct(barcode)
      if (offline) {
        setProduct(offline as Product)
        setLoading(false)
        return
      }
      setError('api_error')
    }
    setLoading(false)
  }

  async function recordScan() {
    if (!isNewScan || hasRecorded.current) return
    hasRecorded.current = true
    incrementAnonScanCount()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetch('/api/scan/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, barcode }),
        })
      }
    } catch {
      // non-blocking
    }
  }

  if (loading) return <ResultSkeleton onBack={() => router.back()} />

  if (error === 'not_found') {
    return (
      <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center animate-fadeIn">
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔍</div>
        <h2 className="heading-display" style={{ fontSize: 22, marginBottom: 8 }}>
          Product not found
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
          We couldn&apos;t find this product in our database. It may not be listed yet.
        </p>
        <Link href="/scan" className="btn-primary inline-block" style={{ maxWidth: 240 }}>
          Scan another product
        </Link>
      </div>
    )
  }

  if (error === 'api_error' || !product) {
    return (
      <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center animate-fadeIn">
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>⚠</div>
        <h2 className="heading-display" style={{ fontSize: 22, marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
          We couldn&apos;t fetch the product. Please try again.
        </p>
        <button onClick={fetchProduct} type="button" className="btn-primary" style={{ maxWidth: 240 }}>
          Retry
        </button>
      </div>
    )
  }

  // Special-category routes keep their existing dedicated views
  if (product.product_type === 'cosmetic') {
    return <CosmeticResult product={product} cosmeticScore={cosmeticScore ?? undefined} onBack={() => router.back()} />
  }
  const specialCategory = detectSpecialCategory(product)
  if (specialCategory === 'infant_formula') return <InfantFormulaResult product={product} onBack={() => router.back()} />
  if (specialCategory === 'medicine')      return <MedicineResult     product={product} onBack={() => router.back()} />
  if (specialCategory === 'supplement')    return <SupplementResult   product={product} onBack={() => router.back()} />

  // Standard food product
  const nutrition = (product.nutrition || {}) as NutritionData
  const rawAdditives = product.additives || []
  const additives: ResolvedAdditive[] = rawAdditives.length > 0
    ? resolveAdditives(rawAdditives.map((a: AdditiveEntry) => `en:${a.code || ''}`))
    : []

  // Recompute the breakdown so we can show pillar bars. lib/scoring is the
  // single source of truth — feed it the same shape we feed at import time.
  const nutriments: Record<string, number> = {}
  if (nutrition.energy != null) nutriments['energy_100g'] = nutrition.energy
  if (nutrition.fat != null) nutriments['fat_100g'] = nutrition.fat
  if (nutrition.saturated_fat != null) nutriments['saturated-fat_100g'] = nutrition.saturated_fat
  if (nutrition.carbs != null) nutriments['carbohydrates_100g'] = nutrition.carbs
  if (nutrition.sugars != null) nutriments['sugars_100g'] = nutrition.sugars
  if (nutrition.fibre != null) nutriments['fiber_100g'] = nutrition.fibre
  if (nutrition.protein != null) nutriments['proteins_100g'] = nutrition.protein
  if (nutrition.salt != null) nutriments['salt_100g'] = nutrition.salt

  const breakdown = calculateQualityBreakdown({
    nova_group: product.nova_score,
    nutriscore_grade: product.nutriscore_grade,
    additives_tags: rawAdditives.map((a) => `en:${(a.code || '').toLowerCase()}`),
    nutriments,
    ingredients_text: product.ingredients,
  })

  const displayScore = getDisplayScore(product.quality_score)
  const scoreClass = getScoreClass(product.quality_score)
  const scoreColor =
    scoreClass === 'score-good' ? '#3d8c5e' : scoreClass === 'score-fair' ? '#fb923c' : '#f87171'
  const verdict =
    scoreClass === 'score-good' ? 'Good — recommended' : scoreClass === 'score-fair' ? 'Fair — eat in moderation' : 'Poor — not recommended'

  // Pillar bars 0-100
  const pillarNutrition = Math.round((breakdown.nutritional / 5) * 100)
  const pillarAdditives = Math.round((breakdown.additives / 2) * 100)
  const pillarIngredients = Math.round((breakdown.processing / 2.5) * 100)

  // Parse ingredients into a list
  const ingredientList = (product.ingredients || '')
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 25)

  // Mark ingredient flagged status by checking against additive E-codes
  const flaggedCodes = new Set(additives.filter((a) => a.risk === 'high' || a.risk === 'medium').map((a) => a.code.toUpperCase()))
  const flaggedCodesArr = Array.from(flaggedCodes)
  function ingredientFlag(ing: string): 'clean' | 'flagged' | 'unknown' {
    const u = ing.toUpperCase()
    for (const code of flaggedCodesArr) {
      if (u.includes(code)) return 'flagged'
    }
    if (/MODIFIED|HYDROGENATED|GLUCOSE-FRUCTOSE|HIGH-FRUCTOSE|MALTODEXTRIN/i.test(ing)) return 'flagged'
    if (/[Ee]\d{3}/.test(ing) && !flaggedCodesArr.length) return 'unknown'
    return 'clean'
  }

  // Nutriscore active letter
  const nsLetter = (product.nutriscore_grade || '').toLowerCase()

  return (
    <div className="max-w-[480px] mx-auto pb-32 animate-fadeIn" style={{ paddingTop: 0 }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5"
        style={{
          background: 'rgba(245, 241, 234, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => router.back()}
          type="button"
          className="rounded-full flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--dark)',
            cursor: 'pointer',
          }}
          aria-label="Back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Scan result</span>
        <div className="flex items-center gap-2">
          <FavouriteButton barcode={barcode} />
        </div>
      </div>

      {/* Product hero */}
      <div className="px-5 pt-5 pb-4 flex gap-3.5 items-start">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 68,
            height: 68,
            borderRadius: 12,
            background: 'var(--cream)',
            border: '1px solid var(--border)',
            fontSize: 26,
          }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} />
          ) : (
            <span>{getCategoryEmoji(product.category || '')}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="heading-display" style={{ fontSize: 19, lineHeight: 1.2, marginBottom: 3 }}>
            {product.name || 'Unknown product'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            {[product.brand, `Barcode ${product.barcode}`].filter(Boolean).join(' · ')}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {product.category?.split(',')[0] && (
              <span className="chip chip-gray">{product.category.split(',')[0].trim()}</span>
            )}
            {breakdown.organic > 0 && <span className="chip chip-green">Organic</span>}
          </div>
        </div>
      </div>

      {/* Score card (dark) */}
      <div
        className="mx-5 mb-5 relative overflow-hidden"
        style={{
          background: 'var(--dark)',
          borderRadius: 20,
          padding: 22,
          color: '#fff',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />
        <div className="flex items-start justify-between mb-5">
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 5,
              }}
            >
              Quality Score
            </div>
            <div className="heading-display" style={{ fontSize: 54, lineHeight: 1, color: scoreColor, letterSpacing: '-0.05em' }}>
              {displayScore}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
              {verdict}
            </div>
          </div>
          {/* Score ring */}
          <svg width="76" height="76" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeDasharray="201"
              strokeDashoffset={201 - (201 * displayScore) / 100}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
        </div>

        {/* Pillars */}
        <div className="flex flex-col gap-2.5">
          <Pillar name="Ingredients" value={pillarIngredients} />
          <Pillar name="Nutrition" value={pillarNutrition} />
          <Pillar name="Additives" value={pillarAdditives} />
        </div>

        {/* NOVA */}
        <div
          className="flex gap-1.5 items-center"
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginRight: 3 }}>Processing</div>
          {[1, 2, 3, 4].map((n) => {
            const colors: Record<number, string> = { 1: '#4ade80', 2: '#a3e635', 3: '#fb923c', 4: '#f87171' }
            const isActive = n === product.nova_score
            return (
              <div
                key={n}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  background: isActive ? colors[n] : 'rgba(255,255,255,0.1)',
                }}
              />
            )
          })}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginLeft: 6, whiteSpace: 'nowrap' }}>
            NOVA {product.nova_score} — {novaWord(product.nova_score)}
          </div>
        </div>
      </div>

      {/* Additives */}
      <div className="px-5 mb-5">
        <div className="heading-display flex items-center gap-2 mb-3" style={{ fontSize: 18 }}>
          Additives
          <span
            style={{
              fontFamily: 'var(--font-body), DM Sans, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--muted)',
              background: 'var(--cream)',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            {additives.length} found
          </span>
        </div>
        {additives.length === 0 ? (
          <div className="card" style={{ padding: 16, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            No additives detected ✨
          </div>
        ) : (
          additives.map((add) => {
            const isOpen = openAdditive === add.code
            const dot =
              add.risk === 'high' ? '#f87171' : add.risk === 'medium' ? '#fb923c' : '#4ade80'
            const badge =
              add.risk === 'high'
                ? { bg: '#fef2f2', color: '#991b1b', label: '● High concern' }
                : add.risk === 'medium'
                ? { bg: '#fff7ed', color: '#9a3412', label: '● Moderate concern' }
                : { bg: '#f0fdf4', color: '#166534', label: '● No concern' }
            return (
              <div key={add.code} className="card mb-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAdditive(isOpen ? null : add.code)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3.5 text-left"
                  style={{ background: 'transparent', cursor: 'pointer' }}
                >
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', minWidth: 38 }}>
                    {add.code}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--dark)' }}>{add.name}</div>
                  {add.function && (
                    <div
                      style={{
                        fontSize: 10,
                        color: '#a8a59c',
                        background: '#f5f3ee',
                        padding: '2px 6px',
                        borderRadius: 7,
                      }}
                    >
                      {add.function}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 11,
                      color: '#ccc',
                      marginLeft: 2,
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  >
                    ▾
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <span
                      className="inline-flex items-center mt-2.5 mb-2"
                      style={{
                        fontSize: 10,
                        padding: '3px 9px',
                        borderRadius: 20,
                        background: badge.bg,
                        color: badge.color,
                        fontWeight: 500,
                      }}
                    >
                      {badge.label}
                    </span>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 10 }}>
                      {add.description}
                    </div>
                    {add.sources && add.sources.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#bbb',
                            marginBottom: 6,
                          }}
                        >
                          Official sources
                        </div>
                        {add.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 mb-1.5"
                            style={{
                              padding: '7px 9px',
                              background: 'var(--cream)',
                              borderRadius: 8,
                              border: '1px solid var(--border)',
                              textDecoration: 'none',
                              color: 'var(--dark)',
                            }}
                          >
                            <span style={{ fontSize: 11, flex: 1 }}>{src.title}</span>
                            <span style={{ fontSize: 10, color: '#bbb' }}>↗</span>
                          </a>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Ingredients */}
      <div className="px-5 mb-5">
        <div className="heading-display flex items-center gap-2 mb-3" style={{ fontSize: 18 }}>
          Ingredients
          <span
            style={{
              fontFamily: 'var(--font-body), DM Sans, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--muted)',
              background: 'var(--cream)',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            {ingredientList.length} total
          </span>
        </div>
        {ingredientList.length === 0 ? (
          <div className="card" style={{ padding: 16, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            No ingredients listed
          </div>
        ) : (
          <>
            <div className="card" style={{ padding: 14 }}>
              {ingredientList.map((ing, i) => {
                const flag = ingredientFlag(ing)
                const dotColor = flag === 'clean' ? '#4ade80' : flag === 'flagged' ? '#fb923c' : '#d1d5db'
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1"
                    style={{
                      borderBottom: i < ingredientList.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                      fontSize: 12,
                      color: '#555',
                    }}
                  >
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    {ing}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-2" style={{ fontSize: 11, color: 'var(--muted)' }}>
              <LegendDot color="#4ade80" label="Clean" />
              <LegendDot color="#fb923c" label="Flagged" />
              <LegendDot color="#d1d5db" label="Unclassified" />
            </div>
          </>
        )}
      </div>

      {/* Nutrition */}
      <div className="px-5 mb-5">
        <div className="heading-display flex items-center gap-2 mb-3" style={{ fontSize: 18 }}>
          Nutrition
          <span
            style={{
              fontFamily: 'var(--font-body), DM Sans, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              color: 'var(--muted)',
              background: 'var(--cream)',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            per 100g
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NutCard label="Calories" value={nutrition.energy} unit="kcal" pct={nutrition.energy ? Math.min(100, Math.round((nutrition.energy / 200) * 100)) : 0} />
          <NutCard label="Sugars" value={nutrition.sugars} unit="g" pct={nutrition.sugars ? Math.min(100, Math.round((nutrition.sugars / 18) * 100)) : 0} variant={nutrition.sugars && nutrition.sugars > 10 ? 'red' : nutrition.sugars && nutrition.sugars > 5 ? 'amber' : 'green'} />
          <NutCard label="Protein" value={nutrition.protein} unit="g" pct={nutrition.protein ? Math.min(100, Math.round((nutrition.protein / 10) * 100)) : 0} />
          <NutCard label="Saturated fat" value={nutrition.saturated_fat} unit="g" pct={nutrition.saturated_fat ? Math.min(100, Math.round((nutrition.saturated_fat / 5) * 100)) : 0} variant={nutrition.saturated_fat && nutrition.saturated_fat > 5 ? 'red' : 'green'} />
          <NutCard label="Fibre" value={nutrition.fibre} unit="g" pct={nutrition.fibre ? Math.min(100, Math.round((nutrition.fibre / 6) * 100)) : 0} variant={nutrition.fibre && nutrition.fibre < 1 ? 'amber' : 'green'} />
          <NutCard label="Salt" value={nutrition.salt} unit="g" pct={nutrition.salt ? Math.min(100, Math.round((nutrition.salt / 1.5) * 100)) : 0} variant={nutrition.salt && nutrition.salt > 1.5 ? 'red' : 'green'} />
        </div>

        {/* Nutriscore strip */}
        {nsLetter && ['a', 'b', 'c', 'd', 'e'].includes(nsLetter) && (
          <div className="mt-3">
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 7 }}>Nutriscore</div>
            <div className="flex gap-1.5">
              {(['a', 'b', 'c', 'd', 'e'] as const).map((g) => {
                const colors: Record<string, string> = {
                  a: '#1a9e3f',
                  b: '#7abf35',
                  c: '#f5c400',
                  d: '#e27802',
                  e: '#d63626',
                }
                const active = g === nsLetter
                return (
                  <div
                    key={g}
                    className="flex items-center justify-center"
                    style={{
                      flex: 1,
                      height: 30,
                      borderRadius: 6,
                      background: colors[g],
                      opacity: active ? 1 : 0.2,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {g.toUpperCase()}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-5 mb-6">
        <div
          style={{
            background: '#f0ede6',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 11,
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}
        >
          IngredScan scores reflect our independent methodology based on Open Food Facts data, EFSA evaluations, and published research. Not regulatory safety ratings. Data: Open Food Facts (CC BY-SA).
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex gap-2.5 px-5"
        style={{
          background: 'var(--soft)',
          borderTop: '1px solid var(--border)',
          padding: '14px 20px calc(14px + env(safe-area-inset-bottom, 0px))',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <button
          type="button"
          style={{
            padding: '14px 18px',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            background: 'transparent',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 14,
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <Link
          href={`/swaps?for=${barcode}`}
          className="flex-1 text-center"
          style={{
            background: 'var(--dark)',
            color: '#fff',
            borderRadius: 12,
            padding: '14px',
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Find better alternatives →
        </Link>
      </div>
    </div>
  )
}

function novaWord(n: number): string {
  switch (n) {
    case 1: return 'unprocessed'
    case 2: return 'culinary'
    case 3: return 'processed'
    case 4: return 'ultra-processed'
    default: return 'unknown'
  }
}

function Pillar({ name, value }: { name: string; value: number }) {
  const color = value >= 70 ? '#4ade80' : value >= 50 ? '#fb923c' : '#f87171'
  return (
    <div className="flex items-center gap-2.5">
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 86, flexShrink: 0 }}>{name}</div>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', minWidth: 24, textAlign: 'right' }}>{value}</div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

function NutCard({
  label,
  value,
  unit,
  pct,
  variant = 'green',
}: {
  label: string
  value: number | null | undefined
  unit: string
  pct: number
  variant?: 'green' | 'amber' | 'red'
}) {
  const barColor = variant === 'red' ? '#f87171' : variant === 'amber' ? '#fb923c' : '#4ade80'
  return (
    <div className="card" style={{ padding: '11px 13px' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
      <div className="heading-display" style={{ fontSize: 17 }}>
        {value != null ? value : '—'}
        {value != null && (
          <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 1, fontFamily: 'var(--font-body), DM Sans, sans-serif' }}>
            {unit}
          </span>
        )}
      </div>
      <div style={{ height: 3, background: 'var(--cream)', borderRadius: 2, marginTop: 7, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: 3, borderRadius: 2, background: barColor }} />
      </div>
    </div>
  )
}

function ResultSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-[480px] mx-auto pb-32 animate-fadeIn">
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={onBack}
          type="button"
          className="rounded-full flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            border: '1px solid var(--border)',
            background: 'transparent',
          }}
          aria-label="Back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Loading…</span>
        <div style={{ width: 34 }} />
      </div>
      <div className="px-5 pt-5 space-y-4">
        <div style={{ height: 80, borderRadius: 14, background: 'var(--card)', border: '1px solid var(--border)' }} className="animate-pulse" />
        <div style={{ height: 220, borderRadius: 20, background: 'var(--dark)', opacity: 0.4 }} className="animate-pulse" />
        <div style={{ height: 100, borderRadius: 14, background: 'var(--card)', border: '1px solid var(--border)' }} className="animate-pulse" />
      </div>
    </div>
  )
}
