'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Product, type NutritionData, type AdditiveEntry } from '@/lib/supabase'
import { resolveAdditives, calculateQualityBreakdown, getEffectiveScore, getScoreColor, getScoreLabel } from '@/lib/scoring'
import { getCategoryEmoji, incrementAnonScanCount } from '@/lib/utils'
import { cacheProductOffline, getOfflineProduct } from '@/lib/offlineCache'
import FavouriteButton from '@/components/FavouriteButton'
import PhotoSubmission from '@/components/PhotoSubmission'
import AllergenAlert from '@/components/AllergenAlert'

type ResolvedAdditive = ReturnType<typeof resolveAdditives>[number]

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const barcode = params.barcode as string
  const isNewScan = searchParams.get('source') === 'scan'
  const hasRecorded = useRef(false)

  const [product, setProduct] = useState<Product | null>(null)
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

    // Check offline cache first for instant display
    const offline = getOfflineProduct(barcode)
    if (offline) {
      setProduct(offline as Product)
      setLoading(false)
      recordScan()
      return
    }

    // Single API call handles DB cache check + external fetch + save
    try {
      const res = await fetch(`/api/scan?barcode=${barcode}`)
      if (!res.ok) {
        setError(res.status === 404 ? 'not_found' : 'api_error')
        setLoading(false)
        return
      }
      const data = await res.json()
      setProduct(data as Product)
      cacheProductOffline(data)
      recordScan()
    } catch {
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
      <PhotoSubmission
        barcode={barcode}
        onProductFound={(p) => {
          setProduct(p as unknown as Product)
          setError(null)
        }}
      />
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

  // Every product type — food, beauty, infant formula, medicine, supplement
  // — now renders through the shared cream-theme layout below. The previously-
  // forked CosmeticResult / MedicineResult / InfantFormulaResult / SupplementResult
  // components still exist as standalone files but are no longer routed to;
  // they will be reintroduced once each has been individually restyled.

  // Memoize all expensive scoring + additive resolution so it doesn't
  // re-run when openAdditive toggles or other state changes.
  const {
    nutrition, additives, breakdown, displayScore, scoreColor, verdict,
    pillarNutrition, pillarAdditives, pillarOrganic,
    hasNutritionData, ingredientList, flaggedCodesArr,
  } = useMemo(() => {
    const nutrition = (product.nutrition || {}) as NutritionData
    const rawAdditives = product.additives || []
    const _additives: ResolvedAdditive[] = rawAdditives.length > 0
      ? resolveAdditives(rawAdditives.map((a: AdditiveEntry) => `en:${a.code || ''}`))
      : []

    const nutriments: Record<string, number> = {}
    if (nutrition.energy != null) nutriments['energy_100g'] = nutrition.energy
    if (nutrition.fat != null) nutriments['fat_100g'] = nutrition.fat
    if (nutrition.saturated_fat != null) nutriments['saturated-fat_100g'] = nutrition.saturated_fat
    if (nutrition.carbs != null) nutriments['carbohydrates_100g'] = nutrition.carbs
    if (nutrition.sugars != null) nutriments['sugars_100g'] = nutrition.sugars
    if (nutrition.fibre != null) nutriments['fiber_100g'] = nutrition.fibre
    if (nutrition.protein != null) nutriments['proteins_100g'] = nutrition.protein
    if (nutrition.salt != null) nutriments['salt_100g'] = nutrition.salt

    const _breakdown = calculateQualityBreakdown({
      nova_group: product.nova_score,
      nutriscore_grade: product.nutriscore_grade,
      additives_tags: rawAdditives.map((a) => `en:${(a.code || '').toLowerCase()}`),
      labels_tags: [],
      nutriments,
      ingredients_text: product.ingredients,
    })

    const _displayScore = getEffectiveScore(product)

    const _ingredientList = (product.ingredients || '')
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 25)

    const _flaggedCodes = new Set(
      _additives.filter((a) => a.risk === 'high' || a.risk === 'medium').map((a) => a.code.toUpperCase()),
    )

    return {
      nutrition,
      additives: _additives,
      breakdown: _breakdown,
      displayScore: _displayScore,
      scoreColor: getScoreColor(_displayScore),
      verdict: getScoreLabel(_displayScore),
      pillarNutrition: _breakdown.nutritionScore,
      pillarAdditives: _breakdown.additiveScore,
      pillarOrganic: _breakdown.organicBonus,
      hasNutritionData: !!_breakdown.nutriscore && _breakdown.nutriscore !== 'unknown',
      ingredientList: _ingredientList,
      flaggedCodesArr: Array.from(_flaggedCodes),
    }
  }, [product])

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

      {/* Allergen alert — shown when user's flagged allergens match ingredients */}
      <AllergenAlert ingredientsText={product.ingredients || ''} />

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
            <img src={product.image_url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover', background: 'var(--cream)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
            {breakdown.organicBonus > 0 && <span className="chip chip-green">Organic</span>}
          </div>
        </div>
      </div>

      {/* Score card */}
      <div
        className="mx-5 mb-5 relative overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 22,
          color: 'var(--dark)',
          boxShadow: `0 2px 14px ${scoreColor}1f`,
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
            background: `${scoreColor}0f`,
          }}
        />
        <div className="flex items-start justify-between mb-5">
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: 5,
              }}
            >
              Quality Score
            </div>
            <div className="heading-display" style={{ fontSize: 54, lineHeight: 1, color: scoreColor, letterSpacing: '-0.05em' }}>
              {displayScore}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {verdict}
            </div>
          </div>
          {/* Score ring */}
          <svg width="76" height="76" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(28,27,24,0.08)" strokeWidth="6" />
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
          <Pillar name="Nutrition" value={pillarNutrition} weight="60%" />
          <Pillar name="Additives" value={pillarAdditives} weight="30%" />
          <Pillar name="Organic" value={pillarOrganic} weight="10%" />
        </div>

        {/* NOVA */}
        <div
          className="flex gap-1.5 items-center"
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--muted)', marginRight: 3 }}>Processing</div>
          {[1, 2, 3, 4].map((n) => {
            const colors: Record<number, string> = { 1: '#3d8c5e', 2: '#7ab55c', 3: '#c8763a', 4: '#c0392b' }
            const isActive = n === product.nova_score
            return (
              <div
                key={n}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  background: isActive ? colors[n] : 'rgba(28,27,24,0.1)',
                }}
              />
            )
          })}
          <div style={{ fontSize: 11, color: 'var(--dark)', marginLeft: 6, whiteSpace: 'nowrap', fontWeight: 500 }}>
            NOVA {product.nova_score} — {novaWord(product.nova_score)}
          </div>
        </div>
      </div>

      {!hasNutritionData && (
        <div
          className="mx-5 mb-5"
          style={{
            background: 'var(--amber-bg)',
            border: '1px solid rgba(200,118,58,0.25)',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>⚠️</span>
          <div style={{ flex: 1, fontSize: 12, color: 'var(--amber-deep)', lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 600 }}>Nutrition data unavailable.</strong>{' '}
            Open Food Facts hasn&apos;t published per-100g values for this product, so the
            Nutrition pillar is running on a neutral 50/100 fallback. The score isn&apos;t
            penalising the product — it&apos;s coping with missing data.
          </div>
        </div>
      )}

      {/* UK safety badge + Eco-score */}
      <div className="flex gap-2.5 mx-5 mb-5">
        <div
          className="flex-1 rounded-xl"
          style={{
            padding: '12px 14px',
            background: 'var(--green-bg)',
            border: '1px solid rgba(61,140,94,0.2)',
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 4 }}>🇬🇧</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-deep)', marginBottom: 2 }}>
            Independently Scored
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
            Using published UK FSA, EFSA &amp; WHO data
          </div>
        </div>
        {!!(product as Record<string, unknown>).ecoscore_grade &&
          ['a', 'b', 'c', 'd', 'e'].includes(
            String((product as Record<string, unknown>).ecoscore_grade).toLowerCase(),
          ) && (
          <div
            className="flex-1 rounded-xl"
            style={{
              padding: '12px 14px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 4 }}>🌍</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark)', marginBottom: 2 }}>
              Eco-Score {String((product as Record<string, unknown>).ecoscore_grade).toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
              Environmental impact from Open Food Facts
            </div>
          </div>
        )}
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
            const regStatuses: Array<{ body: string; status?: string | null }> = [
              { body: 'UK FSA', status: add.uk_status },
              { body: 'EU EFSA', status: add.eu_status },
              { body: 'US FDA', status: add.us_status },
            ].filter((r) => r.status)
            const statusColor = (s?: string | null) => {
              if (!s) return { bg: '#f5f3ee', color: 'var(--muted)' }
              if (s.includes('banned') || s.includes('prohibited'))
                return { bg: '#fdf0ef', color: '#922b21' }
              if (s.includes('warning') || s.includes('restricted'))
                return { bg: '#fdf3ea', color: '#9a5620' }
              return { bg: '#eef6f1', color: '#1d6b43' }
            }
            return (
              <div key={add.code} className="card mb-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAdditive(isOpen ? null : add.code)}
                  className="w-full flex items-start gap-2.5 px-3.5 py-3.5 text-left"
                  style={{ background: 'transparent', cursor: 'pointer' }}
                >
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', minWidth: 38, marginTop: 2 }}>
                    {add.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 500 }}>{add.name}</div>
                      {add.function && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--muted)',
                            background: '#f5f3ee',
                            padding: '2px 6px',
                            borderRadius: 7,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {add.function}
                        </div>
                      )}
                    </div>
                    {add.description && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          lineHeight: 1.45,
                          marginTop: 4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {add.description}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      marginLeft: 2,
                      marginTop: 3,
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  >
                    ▾
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5" style={{ borderTop: '1px solid var(--border)' }}>
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
                    <div style={{ fontSize: 12, color: 'var(--dark)', lineHeight: 1.6, marginBottom: 10 }}>
                      {add.detailed_description || add.description}
                    </div>

                    {add.potential_risks && add.potential_risks.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--muted)',
                            marginBottom: 6,
                          }}
                        >
                          Potential concerns
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--dark)', lineHeight: 1.55 }}>
                          {add.potential_risks.map((risk, i) => (
                            <li key={i} style={{ marginBottom: 3 }}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {regStatuses.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--muted)',
                            marginBottom: 6,
                          }}
                        >
                          Regulatory status
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {regStatuses.map((r) => {
                            const c = statusColor(r.status)
                            return (
                              <span
                                key={r.body}
                                style={{
                                  fontSize: 10,
                                  padding: '3px 9px',
                                  borderRadius: 20,
                                  background: c.bg,
                                  color: c.color,
                                  fontWeight: 500,
                                }}
                              >
                                {r.body}: {r.status?.replace(/_/g, ' ')}
                              </span>
                            )
                          })}
                        </div>
                        {add.uk_notes && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
                            {add.uk_notes}
                          </div>
                        )}
                      </div>
                    )}

                    {add.sources && add.sources.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--muted)',
                            marginBottom: 6,
                          }}
                        >
                          Approved body references
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
                            <span style={{ fontSize: 11, flex: 1 }}>
                              {src.title}
                              {src.year ? <span style={{ color: 'var(--muted)', marginLeft: 6 }}>({src.year})</span> : null}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>↗</span>
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

function Pillar({ name, value, weight }: { name: string; value: number; weight?: string }) {
  const color = value >= 70 ? '#3d8c5e' : value >= 45 ? '#c8763a' : '#c0392b'
  return (
    <div className="flex items-center gap-2.5">
      <div style={{ fontSize: 11, color: 'var(--muted)', width: 86, flexShrink: 0 }}>
        {name}
        {weight && <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 4, opacity: 0.7 }}>{weight}</span>}
      </div>
      <div style={{ flex: 1, height: 3, background: 'rgba(28,27,24,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--dark)', minWidth: 24, textAlign: 'right', fontWeight: 500 }}>{value}</div>
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
