'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, CosmeticIngredientMatch } from '@/lib/supabase'
import { getCosmeticScoreColor, getCosmeticScoreLabel, getConcernLevel } from '@/lib/cosmeticScoring'
import type { CosmeticScore } from '@/lib/cosmeticScoring'
import ShareButton from './ShareCard'
import ProductReport from './ProductReport'
import Logo from './Logo'

interface CosmeticResultProps {
  product: Product
  cosmeticScore?: CosmeticScore
  onBack: () => void
}

const TABS = ['Overview', 'Ingredients', 'Concerns', 'Alternatives'] as const
type Tab = typeof TABS[number]

export default function CosmeticResult({ product, cosmeticScore, onBack }: CosmeticResultProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null)
  const [ingredientFilter, setIngredientFilter] = useState('')

  const ingredients: CosmeticIngredientMatch[] = product.inci_ingredients || []
  const score = cosmeticScore || {
    overallScore: product.quality_score,
    safetyScore: product.quality_score,
    transparencyScore: ingredients.length > 5 ? 8 : 5,
    label: getCosmeticScoreLabel(product.quality_score),
    concerns: product.cosmetic_concerns || [],
    highlights: [],
    flags: [],
  }

  const concernLevel = getConcernLevel(ingredients)

  // Flags
  const positiveFlags: string[] = []
  const negativeFlags: string[] = []

  if (product.is_vegan) positiveFlags.push('Vegan')
  if (product.is_cruelty_free) positiveFlags.push('Cruelty-Free')
  if (product.fragrance_free) positiveFlags.push('Fragrance-Free')
  if (product.paraben_free) positiveFlags.push('Paraben-Free')
  if (product.sulphate_free) positiveFlags.push('Sulphate-Free')
  if (product.silicone_free) positiveFlags.push('Silicone-Free')
  if (product.alcohol_free) positiveFlags.push('Alcohol-Free')

  score.flags.forEach(f => negativeFlags.push(f))

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 max-w-lg mx-auto"
        style={{
          background: 'rgba(11,11,15,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <button onClick={onBack} className="p-2 rounded-xl glass-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0f0f4" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
        <Logo size="small" />
        <ShareButton product={product} />
      </header>

      <div className="px-5 max-w-lg mx-auto space-y-4 relative z-10">
        {/* Product card */}
        <div className="rounded-2xl p-5 animate-fadeUp glass-card">
          <div className="flex items-start gap-4">
            {product.image_url ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: '#1c1c26' }}>
                <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: 'rgba(28,28,38,0.8)' }}>
                💄
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold leading-tight heading-display" style={{ color: '#f0f0f4', letterSpacing: '-0.03em' }}>
                {product.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(240,240,244,0.4)' }}>{product.brand}</p>
              <span
                className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.15)' }}
              >
                💄 Cosmetics
              </span>
            </div>
          </div>

          {/* Negative flags */}
          {negativeFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {negativeFlags.map(flag => (
                <span key={flag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#ff5a5a15', color: '#ff5a5a', border: '1px solid rgba(255,90,90,0.1)' }}>
                  ⚠ {flag}
                </span>
              ))}
            </div>
          )}

          {/* Positive flags */}
          {positiveFlags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {positiveFlags.map(flag => (
                <span key={flag} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(34,199,126,0.1)', color: '#22c77e', border: '1px solid rgba(34,199,126,0.1)' }}>
                  ✓ {flag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score cards */}
        <div className="flex gap-3 animate-fadeUp" style={{ animationDelay: '50ms' }}>
          {/* Safety Score */}
          <div className="flex-1 rounded-2xl p-4 glass-card text-center">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Safety Score
            </p>
            <p className="text-3xl font-bold heading-display" style={{ color: getCosmeticScoreColor(score.overallScore) }}>
              {score.overallScore.toFixed(1)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,244,0.45)' }}>/10</p>
            <span
              className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: `${getCosmeticScoreColor(score.overallScore)}15`, color: getCosmeticScoreColor(score.overallScore) }}
            >
              {score.label}
            </span>
          </div>

          {/* Concern Level */}
          <div className="flex-1 rounded-2xl p-4 glass-card text-center">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(240,240,244,0.4)' }}>
              Concern Level
            </p>
            <p className="text-3xl mb-1">{concernLevel.emoji}</p>
            <p className="text-xs font-semibold uppercase" style={{ color: concernLevel.color }}>
              {concernLevel.level}
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(240,240,244,0.5)' }}>
              {concernLevel.text}
            </p>
          </div>
        </div>

        {/* Data source badge */}
        <div
          className="rounded-xl px-4 py-3 text-center animate-fadeUp glass-subtle"
          style={{ borderColor: 'rgba(168,85,247,0.15)', animationDelay: '100ms' }}
        >
          <p className="text-xs font-medium" style={{ color: '#a855f7' }}>
            🔍 {product.data_source} · {product.confidence}% verified
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-xl p-1 glass-card animate-fadeUp" style={{ animationDelay: '120ms' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab
            const label = tab === 'Ingredients' ? `Ingredients (${ingredients.length})` : tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(168,85,247,0.15)' : 'transparent',
                  color: isActive ? '#a855f7' : 'rgba(240,240,244,0.4)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="animate-fadeUp" style={{ animationDelay: '150ms' }}>
          {activeTab === 'Overview' && (
            <OverviewTab product={product} score={score} ingredients={ingredients} />
          )}
          {activeTab === 'Ingredients' && (
            <IngredientsTab
              ingredients={ingredients}
              filter={ingredientFilter}
              setFilter={setIngredientFilter}
              expanded={expandedIngredient}
              setExpanded={setExpandedIngredient}
            />
          )}
          {activeTab === 'Concerns' && (
            <ConcernsTab ingredients={ingredients} />
          )}
          {activeTab === 'Alternatives' && (
            <AlternativesTab product={product} />
          )}
        </div>

        {/* Report */}
        <ProductReport barcode={product.barcode} />
      </div>

      {/* Sticky bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(11,11,15,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-lg mx-auto px-5 py-3">
          <Link href="/scan" className="block w-full text-center py-3.5 rounded-xl text-sm font-semibold btn-glow transition-all" style={{ color: '#0b0b0f' }}>
            Scan Another Product
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ---- TAB COMPONENTS ---- */

function OverviewTab({ product, score, ingredients }: {
  product: Product
  score: CosmeticScore
  ingredients: CosmeticIngredientMatch[]
}) {
  const certifications: string[] = []
  if (product.is_vegan) certifications.push('Vegan')
  if (product.is_cruelty_free) certifications.push('Cruelty-Free')
  if (product.is_natural) certifications.push('Natural / Organic')

  return (
    <div className="space-y-4">
      {/* Ingredient count */}
      <div className="rounded-2xl p-4 glass-card">
        <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(240,240,244,0.4)' }}>Ingredients</p>
        <p className="text-2xl font-bold heading-display" style={{ color: '#f0f0f4' }}>{ingredients.length}</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(240,240,244,0.5)' }}>
          {ingredients.filter(i => i.risk_level === 'high').length} high concern · {ingredients.filter(i => i.risk_level === 'medium').length} medium · {ingredients.filter(i => i.risk_level === 'low').length} low
        </p>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="rounded-2xl p-4 glass-card">
          <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'rgba(240,240,244,0.4)' }}>Certifications</p>
          <div className="flex flex-wrap gap-2">
            {certifications.map(cert => (
              <span key={cert} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(34,199,126,0.1)', color: '#22c77e' }}>
                ✓ {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key concerns */}
      {score.concerns.length > 0 && (
        <div className="rounded-2xl p-4 glass-card">
          <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'rgba(240,240,244,0.4)' }}>Key Concerns</p>
          <div className="space-y-2">
            {score.concerns.map(concern => (
              <div key={concern} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#ff5a5a' }} />
                <p className="text-sm" style={{ color: 'rgba(240,240,244,0.7)' }}>{concern}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key highlights */}
      {score.highlights.length > 0 && (
        <div className="rounded-2xl p-4 glass-card">
          <p className="text-xs uppercase tracking-wider font-medium mb-3" style={{ color: 'rgba(240,240,244,0.4)' }}>Highlights</p>
          <div className="space-y-2">
            {score.highlights.map(highlight => (
              <div key={highlight} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#22c77e' }} />
                <p className="text-sm" style={{ color: 'rgba(240,240,244,0.7)' }}>{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function IngredientsTab({ ingredients, filter, setFilter, expanded, setExpanded }: {
  ingredients: CosmeticIngredientMatch[]
  filter: string
  setFilter: (v: string) => void
  expanded: string | null
  setExpanded: (v: string | null) => void
}) {
  // Sort: high risk first, then medium, then low
  const riskOrder = { high: 0, medium: 1, low: 2 }
  const sorted = [...ingredients].sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level])
  const filtered = filter
    ? sorted.filter(i =>
        i.inci_name.toLowerCase().includes(filter.toLowerCase()) ||
        (i.common_name || '').toLowerCase().includes(filter.toLowerCase())
      )
    : sorted

  const riskDot = (level: string) => {
    const colors: Record<string, string> = { low: '#22c77e', medium: '#f5a623', high: '#ff5a5a' }
    return colors[level] || '#22c77e'
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.45)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search ingredients..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none glass-input"
          style={{ color: '#f0f0f4' }}
        />
      </div>

      {/* Ingredient list */}
      <div className="space-y-0.5">
        {filtered.map(ing => {
          const isExpanded = expanded === ing.inci_name
          return (
            <button
              key={ing.inci_name}
              onClick={() => setExpanded(isExpanded ? null : ing.inci_name)}
              className="w-full text-left rounded-xl px-4 py-3 transition-all glass-card"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: riskDot(ing.risk_level) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f0f0f4' }}>{ing.inci_name}</p>
                  {ing.common_name && (
                    <p className="text-xs truncate" style={{ color: 'rgba(240,240,244,0.4)' }}>{ing.common_name}</p>
                  )}
                </div>
                {ing.function && ing.function.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,244,0.4)' }}>
                    {ing.function[0]}
                  </span>
                )}
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,244,0.45)" strokeWidth="2"
                  className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </div>
              {isExpanded && ing.description && (
                <div className="mt-3 pl-5 space-y-2">
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.6)' }}>{ing.description}</p>
                  {ing.concerns && ing.concerns.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ing.concerns.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,90,90,0.08)', color: '#ff5a5a' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {ing.safe_for_pregnant === false && (
                    <p className="text-[10px] font-medium" style={{ color: '#f5a623' }}>⚠ Avoid during pregnancy</p>
                  )}
                  {ing.ewg_score && (
                    <p className="text-[10px]" style={{ color: 'rgba(240,240,244,0.5)' }}>EWG score: {ing.ewg_score}/10</p>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'rgba(240,240,244,0.45)' }}>No ingredients match your search</p>
        </div>
      )}
    </div>
  )
}

function ConcernsTab({ ingredients }: { ingredients: CosmeticIngredientMatch[] }) {
  const highRisk = ingredients.filter(i => i.risk_level === 'high')
  const mediumRisk = ingredients.filter(i => i.risk_level === 'medium')

  if (highRisk.length === 0 && mediumRisk.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center glass-card" style={{ borderColor: 'rgba(34,199,126,0.15)' }}>
        <p className="text-2xl mb-2">✓</p>
        <p className="text-sm font-medium" style={{ color: '#22c77e' }}>No high-concern ingredients found</p>
        <p className="text-xs mt-2" style={{ color: 'rgba(240,240,244,0.4)' }}>
          This product uses generally well-tolerated ingredients. Individual reactions may still vary.
        </p>
        {ingredients.filter(i => i.risk_level === 'low').length > 0 && (
          <div className="mt-4 space-y-1.5">
            {ingredients.filter(i => i.risk_level === 'low' && i.common_name).slice(0, 5).map(i => (
              <p key={i.inci_name} className="text-xs" style={{ color: 'rgba(240,240,244,0.5)' }}>
                🟢 {i.common_name} — {(i.function || [])[0] || 'ingredient'}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {highRisk.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff5a5a' }} />
            <h4 className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#ff5a5a' }}>High Concern</h4>
          </div>
          <div className="space-y-2">
            {highRisk.map(ing => (
              <div key={ing.inci_name} className="rounded-xl p-4 glass-card" style={{ borderColor: 'rgba(255,90,90,0.1)' }}>
                <p className="text-sm font-semibold" style={{ color: '#f0f0f4' }}>{ing.common_name || ing.inci_name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,240,244,0.5)' }}>{ing.inci_name}</p>
                {ing.description && <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(240,240,244,0.6)' }}>{ing.description}</p>}
                {ing.concerns && ing.concerns.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ing.concerns.map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,90,90,0.08)', color: '#ff5a5a' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {mediumRisk.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f5a623' }} />
            <h4 className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#f5a623' }}>Medium Concern</h4>
          </div>
          <div className="space-y-2">
            {mediumRisk.map(ing => (
              <div key={ing.inci_name} className="rounded-xl p-4 glass-card" style={{ borderColor: 'rgba(245,166,35,0.1)' }}>
                <p className="text-sm font-semibold" style={{ color: '#f0f0f4' }}>{ing.common_name || ing.inci_name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,240,244,0.5)' }}>{ing.inci_name}</p>
                {ing.description && <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(240,240,244,0.6)' }}>{ing.description}</p>}
                {ing.concerns && ing.concerns.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ing.concerns.map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,166,35,0.08)', color: '#f5a623' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlternativesTab({ product }: { product: Product }) {
  const retailers = ['Boots', 'Superdrug', 'Holland & Barrett', 'ASOS Beauty', 'Look Fantastic']
  const categoryName = (product.category || '').split(',')[0]?.trim() || 'this product type'

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 glass-card">
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#f0f0f4' }}>Better alternatives for {categoryName}</h4>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,240,244,0.4)' }}>
          We&apos;re building our cosmetic alternatives database. Soon you&apos;ll see products with higher safety scores from these retailers:
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {retailers.map(r => (
            <span key={r} className="px-3 py-1.5 rounded-full text-xs font-medium glass-subtle" style={{ color: 'rgba(240,240,244,0.5)' }}>
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-5 text-center glass-card">
        <p className="text-2xl mb-2">🔜</p>
        <p className="text-sm font-medium" style={{ color: 'rgba(240,240,244,0.5)' }}>
          Cosmetic alternatives coming soon
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(240,240,244,0.45)' }}>
          We&apos;re analysing products to find safer alternatives matched by category.
        </p>
      </div>
    </div>
  )
}
