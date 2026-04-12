'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getEffectiveScore, getScoreClass } from '@/lib/scoring'
import { getCategoryEmoji } from '@/lib/utils'

// Better-alternatives browser. If a `?for=<barcode>` query is supplied we
// fetch the source product and look for higher-scoring products in the same
// category. Otherwise we show the highest-quality products globally.

type AltProduct = {
  barcode: string
  name: string
  brand: string
  quality_score: number | null
  quality_score_v3: number | null
  effective_score: number
  category: string
  country: string | null
  categories_tags: string[]
  image_url?: string
  additives_count: number
  is_organic?: boolean
}

type FilterKey = 'all' | 'no-additives' | 'organic' | 'food' | 'cosmetic'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'no-additives', label: 'No additives' },
  { key: 'organic', label: 'Organic' },
  { key: 'food', label: 'Food' },
  { key: 'cosmetic', label: 'Cosmetics' },
]

export default function SwapsPage() {
  // useSearchParams() needs a Suspense boundary so the page can still be
  // statically prerendered at build time.
  return (
    <Suspense fallback={<SwapsFallback />}>
      <SwapsPageBody />
    </Suspense>
  )
}

function SwapsFallback() {
  return (
    <div className="max-w-[480px] mx-auto pt-20 pb-24 px-6 text-center" style={{ color: 'var(--muted)' }}>
      Loading…
    </div>
  )
}

function SwapsPageBody() {
  const searchParams = useSearchParams()
  const sourceBarcode = searchParams.get('for')
  const [source, setSource] = useState<AltProduct | null>(null)
  const [alts, setAlts] = useState<AltProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    loadAlternatives()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceBarcode])

  async function loadAlternatives() {
    setLoading(true)

    // v4 score threshold on the 0-100 scale. 55 ≈ Fair or above.
    const MIN_V3 = 55
    const baseSelect =
      'barcode, name, brand, quality_score, quality_score_v3, category, categories_tags, country, image_url, additives, is_organic'

    let sourceTags: string[] = []
    let sourceCountry: string | null = null

    if (sourceBarcode) {
      const { data } = await supabase
        .from('products')
        .select(baseSelect)
        .eq('barcode', sourceBarcode)
        .single()
      if (data) {
        setSource(mapRow(data))
        sourceTags = (data.categories_tags as string[]) || []
        sourceCountry = (data.country as string | null) || null
      }
    }

    // OFF category tags are hierarchical (en:cereals → en:noodles →
    // en:instant-noodles). The tail is the most specific — try it first,
    // then broaden if we don't have enough matches.
    const tryTags = [...sourceTags].reverse().slice(0, 3)

    const runQuery = async (tag: string | null) => {
      let q = supabase
        .from('products')
        .select(baseSelect)
        .eq('import_source', 'openfoodfacts')
        .not('quality_score_v3', 'is', null)
        .gte('quality_score_v3', MIN_V3)

      if (tag) q = q.contains('categories_tags', [tag])
      if (sourceCountry) q = q.eq('country', sourceCountry)

      return q.order('quality_score_v3', { ascending: false }).limit(40)
    }

    // 1. Fire all tag queries in parallel — pick the first with >= 5 results.
    if (tryTags.length > 0) {
      const tagResults = await Promise.all(tryTags.map((tag) => runQuery(tag)))
      for (const { data } of tagResults) {
        if (data && data.length >= 5) {
          setAlts((data as Array<Record<string, unknown>>).map(mapRow))
          setLoading(false)
          return
        }
      }
    }

    // 2. Country-scoped, no tag.
    if (sourceCountry) {
      const { data } = await runQuery(null)
      if (data && data.length > 0) {
        setAlts((data as Array<Record<string, unknown>>).map(mapRow))
        setLoading(false)
        return
      }
    }

    // 3. Global fallback.
    const { data: global } = await supabase
      .from('products')
      .select(baseSelect)
      .eq('import_source', 'openfoodfacts')
      .not('quality_score_v3', 'is', null)
      .gte('quality_score_v3', MIN_V3)
      .order('quality_score_v3', { ascending: false })
      .limit(40)

    setAlts(((global || []) as Array<Record<string, unknown>>).map(mapRow))
    setLoading(false)
  }

  const filtered = alts.filter((a) => {
    if (sourceBarcode && a.barcode === sourceBarcode) return false
    if (filter === 'no-additives' && a.additives_count > 0) return false
    if (filter === 'organic' && !a.is_organic) return false
    return true
  })

  return (
    <div className="max-w-[480px] mx-auto pt-16 pb-24 animate-fadeIn">
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Link
          href={sourceBarcode ? `/result/${sourceBarcode}` : '/'}
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
        </Link>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Better alternatives</span>
      </div>

      {source ? (
        <div
          className="mx-5 mt-4 mb-4 p-4"
          style={{
            background: 'var(--amber-bg)',
            borderRadius: 14,
            border: '1px solid rgba(200, 118, 58, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--amber)',
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            Replacing
          </div>
          <div style={{ fontSize: 13, color: '#7a4210', lineHeight: 1.4 }}>
            {source.name} — Score {source.effective_score}/100 ·{' '}
            {source.additives_count} additive{source.additives_count === 1 ? '' : 's'}
          </div>
        </div>
      ) : (
        <div
          className="mx-5 mt-4 mb-4 p-4"
          style={{
            background: 'var(--green-bg)',
            borderRadius: 14,
            border: '1px solid rgba(61, 140, 94, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--green)',
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            Browse
          </div>
          <div style={{ fontSize: 13, color: 'var(--green-deep)', lineHeight: 1.4 }}>
            Highest-quality products in our database. Tap any one to see why it scores well.
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            type="button"
            className="flex-shrink-0 whitespace-nowrap"
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              border: '1px solid var(--border)',
              background: filter === f.key ? 'var(--dark)' : 'var(--card)',
              color: filter === f.key ? '#fff' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-3" style={{ fontSize: 12, color: 'var(--muted)' }}>
        {loading ? 'Loading…' : `${filtered.length} products · sorted by quality score`}
      </div>

      {!loading &&
        filtered.map((alt) => {
          const altScore = alt.effective_score
          const improvement = source ? altScore - source.effective_score : null
          const cls = getScoreClass(altScore)
          const color =
            cls === 'score-good' ? 'var(--green)' : cls === 'score-fair' ? 'var(--amber)' : 'var(--red)'
          return (
            <Link
              key={alt.barcode}
              href={`/result/${alt.barcode}`}
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 11,
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  fontSize: 22,
                }}
              >
                {alt.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={alt.image_url} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', borderRadius: 11, objectFit: 'cover', background: 'var(--cream)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <span>{getCategoryEmoji(alt.category)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {alt.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {alt.brand}
                  {alt.category ? ` · ${alt.category.split(',')[0]}` : ''}
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {alt.is_organic && <span className="chip chip-green">Organic</span>}
                  <span className="chip chip-green">
                    {alt.additives_count} additive{alt.additives_count === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="heading-display" style={{ fontSize: 22, color }}>
                  {altScore}
                </div>
                {improvement != null && improvement > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 500 }}>
                    +{improvement} pts
                  </div>
                )}
              </div>
            </Link>
          )
        })}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center px-10" style={{ color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🔍</div>
          <div style={{ fontSize: 14 }}>
            No alternatives match this filter — try clearing it.
          </div>
        </div>
      )}
    </div>
  )
}

function mapRow(row: Record<string, unknown>): AltProduct {
  const additives = Array.isArray(row.additives) ? row.additives : []
  const v3 = row.quality_score_v3 as number | null | undefined
  const v2 = row.quality_score as number | null | undefined
  return {
    barcode: row.barcode as string,
    name: (row.name as string) || 'Unknown',
    brand: (row.brand as string) || '',
    quality_score: v2 ?? null,
    quality_score_v3: v3 ?? null,
    effective_score: getEffectiveScore({ quality_score_v3: v3, quality_score: v2 }),
    category: (row.category as string) || '',
    country: (row.country as string | null) || null,
    categories_tags: (row.categories_tags as string[]) || [],
    image_url: (row.image_url as string) || '',
    additives_count: additives.length,
    is_organic: Boolean(row.is_organic),
  }
}
