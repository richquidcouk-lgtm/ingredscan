import additiveDatabase from '@/data/additives.json'
import { getTier } from './additives'

type OpenFoodFactsProduct = {
  nova_group?: number
  nutriscore_grade?: string
  ingredients_tags?: string[]
  additives_tags?: string[]
  categories_tags?: string[]
  labels_tags?: string[]
  nutriments?: Record<string, number>
  ingredients_text?: string
}

// ---------------------------------------------------------------------------
// Quality Score Breakdown — version 5 (Yuka-aligned 3-pillar formula)
//
// v5 changes (2026-04-11):
//   - Nutrition pillar now maps Nutri-Score grade → base directly (no more
//     halving + hand-tuned bonus/penalty layering).
//   - When OFF doesn't ship a grade, we compute one ourselves from
//     nutriments using the 2017 Nutri-Score thresholds for solid foods.
//   - Additive pillar scans ingredients_text for E-numbers in addition to
//     OFF's additives_tags, so Yuka-visible additives we were missing now
//     count toward the pillar.
//
// Score is natively 0-100. NOVA has zero influence on the quality score.
// ---------------------------------------------------------------------------

export type AdditiveFlag = {
  code: string            // e.g. "E250"
  tag: string             // original OFF tag, e.g. "en:e250"
  tier: 0 | 1 | 2 | 3
  risk: 'none' | 'low' | 'medium' | 'high'
}

export type QualityScoreBreakdown = {
  nutritionScore: number   // 0-100
  additiveScore: number    // 0-100
  organicBonus: number     // 0 or 100
  qualityScore: number     // 0-100 (weighted composite)
  nutriscore: string       // a-e or 'unknown'
  nova: number             // 1-4 (display only)
  additiveFlags: AdditiveFlag[]  // per-additive tier breakdown (sorted worst-first)
  version: number          // 5
}

export type ScoringResult = {
  nova_score: number
  quality_score: number        // 0-100
  quality_breakdown: QualityScoreBreakdown
  confidence: number
  warning: string | null
  is_fresh_produce: boolean
}

// ---------------------------------------------------------------------------
// Nutriscore base mapping
// ---------------------------------------------------------------------------

const NUTRISCORE_BASE: Record<string, number> = {
  a: 100, b: 80, c: 60, d: 35, e: 10,
}

// ---------------------------------------------------------------------------
// Nutri-Score computation (2017 thresholds, general solid foods)
//
// Used when OFF doesn't supply a `nutriscore_grade`. Yuka does this too —
// they never show "unknown nutrition"; they derive it from the nutrient
// table. Thresholds match the published Santé publique France algorithm.
// ---------------------------------------------------------------------------

function stepPoints(value: number, thresholds: number[]): number {
  // Returns the number of thresholds the value strictly exceeds (0 to N).
  let pts = 0
  for (const t of thresholds) if (value > t) pts++
  return pts
}

// kJ/100g boundaries — score rises 0..10
const ENERGY_KJ = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350]
// g/100g boundaries — score rises 0..10
const SUGARS_G = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45]
const SAT_FAT_G = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// mg/100g sodium boundaries — score rises 0..10
const SODIUM_MG = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900]
// g/100g boundaries — positives rise 0..5
const PROTEIN_G = [1.6, 3.2, 4.8, 6.4, 8.0]
const FIBRE_G = [0.9, 1.9, 2.8, 3.7, 4.7]

export function computeNutriScoreGrade(
  nutriments: Record<string, number>,
): 'a' | 'b' | 'c' | 'd' | 'e' | null {
  const energyKj = nutriments['energy_100g']
  const sugars = nutriments['sugars_100g']
  const satFat = nutriments['saturated-fat_100g']
  const salt = nutriments['salt_100g']
  const protein = nutriments['proteins_100g']
  const fibre = nutriments['fiber_100g']

  // Need at least energy, sugars, satfat, salt, protein to compute anything
  // sensible. Fibre and fruits/veg can default to zero.
  if (
    energyKj == null ||
    sugars == null ||
    satFat == null ||
    salt == null ||
    protein == null
  ) {
    return null
  }

  const nEnergy = stepPoints(energyKj, ENERGY_KJ)
  const nSugars = stepPoints(sugars, SUGARS_G)
  const nSatFat = stepPoints(satFat, SAT_FAT_G)
  const sodiumMg = salt * 400 // salt to sodium conversion
  const nSodium = stepPoints(sodiumMg, SODIUM_MG)
  const N = nEnergy + nSugars + nSatFat + nSodium

  const pProtein = stepPoints(protein, PROTEIN_G)
  const pFibre = stepPoints(fibre ?? 0, FIBRE_G)
  const pFruitVeg = 0 // we don't have this field at import time

  // Official rule: if N >= 11 and fruits/veg points < 5, protein doesn't count
  const P =
    N >= 11 && pFruitVeg < 5 ? pFibre + pFruitVeg : pProtein + pFibre + pFruitVeg

  const score = N - P

  if (score <= -1) return 'a'
  if (score <= 2) return 'b'
  if (score <= 10) return 'c'
  if (score <= 18) return 'd'
  return 'e'
}

// ---------------------------------------------------------------------------
// Pillar 1 — Nutrition Score (60% weight)
//
// Maps Nutri-Score grade directly to a 0-100 base. No hand-tuned bonuses or
// penalties layered on top — Yuka uses Nutri-Score's own point system.
// If OFF didn't ship a grade, we compute one ourselves from nutriments.
// ---------------------------------------------------------------------------

function calcNutritionScore(
  nutriments: Record<string, number>,
  nutriscoreGrade: string,
): { score: number; grade: string } {
  let grade = nutriscoreGrade.toLowerCase()

  if (!['a', 'b', 'c', 'd', 'e'].includes(grade)) {
    const computed = computeNutriScoreGrade(nutriments)
    if (computed) grade = computed
  }

  if (!['a', 'b', 'c', 'd', 'e'].includes(grade)) {
    // Genuinely no data — stay neutral rather than punishing.
    return { score: 50, grade: 'unknown' }
  }

  return { score: NUTRISCORE_BASE[grade], grade }
}

// ---------------------------------------------------------------------------
// Pillar 2 — Additive Score (30% weight)
//
// Yuka method: score is determined by the RISKIEST additive present, not by
// cumulative stacking. Limited-risk and risk-free additives don't pile on top
// of a hazardous one — the worst tier sets the pillar.
// ---------------------------------------------------------------------------

const TIER_TO_RISK: Record<0 | 1 | 2 | 3, AdditiveFlag['risk']> = {
  0: 'none',
  1: 'low',
  2: 'medium',
  3: 'high',
}

/**
 * Extract E-number tags from raw ingredients text. OFF's `additives_tags` is
 * often incomplete (Yuka is better at parsing ingredient labels), so we do our
 * own pass over the text and merge with whatever OFF supplied.
 *
 * Matches patterns like "E621", "E 621", "E-621", "(E 102)", "e102a".
 */
export function extractAdditiveTagsFromText(text: string): string[] {
  if (!text) return []
  const found = new Set<string>()
  const regex = /\bE\s*-?\s*(\d{3,4})([a-z])?\b/gi
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    const num = m[1]
    const suffix = (m[2] || '').toLowerCase()
    found.add(`en:e${num}${suffix}`)
  }
  return Array.from(found)
}

function mergeAdditiveTags(existing: string[], extracted: string[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const t of [...existing, ...extracted]) {
    const n = (t || '').toLowerCase().trim()
    if (!n || seen.has(n)) continue
    seen.add(n)
    merged.push(n)
  }
  return merged
}

function buildAdditiveFlags(additiveTags: string[]): AdditiveFlag[] {
  const seen = new Set<string>()
  const flags: AdditiveFlag[] = []
  for (const tag of additiveTags) {
    const norm = tag.toLowerCase().trim()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    const tier = getTier(norm)
    const code = norm.replace(/^en:/, '').toUpperCase()
    flags.push({ code, tag: norm, tier, risk: TIER_TO_RISK[tier] })
  }
  // Worst-first ordering so the UI can render the most important flags at the top
  flags.sort((a, b) => b.tier - a.tier)
  return flags
}

function calcAdditiveScore(flags: AdditiveFlag[]): number {
  let maxTier = 0
  for (const f of flags) {
    if (f.tier > maxTier) maxTier = f.tier
    if (maxTier === 3) break
  }
  switch (maxTier) {
    case 3: return 49   // hazardous — Yuka cap
    case 2: return 75   // moderate — Yuka cap
    case 1: return 90   // limited
    default: return 100 // risk-free / none
  }
}

// ---------------------------------------------------------------------------
// Pillar 3 — Organic Bonus (10% weight)
// ---------------------------------------------------------------------------

function calcOrganicBonus(labels: string[]): number {
  const isOrganic = labels.some(l =>
    ['en:organic', 'en:eu-organic', 'en:soil-association-organic'].includes(
      l.toLowerCase(),
    ),
  )
  return isOrganic ? 100 : 0
}

// ---------------------------------------------------------------------------
// NOVA — Processing Level (display only, zero influence on quality score)
// ---------------------------------------------------------------------------

export function inferNovaScore(product: OpenFoodFactsProduct): number {
  // Use OFF nova_group if available
  if (product.nova_group && product.nova_group >= 1 && product.nova_group <= 4) {
    return product.nova_group
  }
  // Fallback inference based on additive count
  const addCount = (product.additives_tags ?? []).length
  if (addCount === 0) return 1
  if (addCount <= 2) return 3
  return 4
}

// ---------------------------------------------------------------------------
// Nutrition flags for UI display
// ---------------------------------------------------------------------------

export function detectFlags(product: OpenFoodFactsProduct): string[] {
  const flags: string[] = []
  const n = product.nutriments || {}

  if ((n['sugars_100g'] ?? 0) > 15)
    flags.push(`High added sugar (${n['sugars_100g']}g/100g)`)
  if ((n['saturated-fat_100g'] ?? 0) > 5)
    flags.push(`High saturated fat (${n['saturated-fat_100g']}g/100g)`)
  if ((n['salt_100g'] ?? 0) > 1.5)
    flags.push(`High salt (${n['salt_100g']}g/100g)`)
  if ((n['fiber_100g'] ?? 0) < 1)
    flags.push('Low in fibre')
  if ((n['proteins_100g'] ?? 0) < 2)
    flags.push('Low in protein')

  return flags
}

// ---------------------------------------------------------------------------
// Main quality score — 3-pillar Yuka-aligned formula
// ---------------------------------------------------------------------------

export function calculateQualityBreakdown(
  product: OpenFoodFactsProduct,
): QualityScoreBreakdown {
  const nutriments = product.nutriments || {}
  const grade = (product.nutriscore_grade || '').toLowerCase()

  // Merge OFF's additives_tags with E-numbers extracted from the ingredients
  // text — OFF's tag list is often missing entries that are clearly visible
  // in the ingredients label.
  const extractedTags = extractAdditiveTagsFromText(product.ingredients_text || '')
  const mergedTags = mergeAdditiveTags(product.additives_tags || [], extractedTags)
  const additiveFlags = buildAdditiveFlags(mergedTags)

  const nutrition = calcNutritionScore(nutriments, grade)
  const nutritionScore = nutrition.score
  const effectiveGrade = nutrition.grade
  const additiveScore = calcAdditiveScore(additiveFlags)
  const organicBonus = calcOrganicBonus(product.labels_tags || [])

  const qualityScore = Math.round(
    nutritionScore * 0.60 +
    additiveScore * 0.30 +
    organicBonus * 0.10,
  )

  const nova = inferNovaScore(product)

  return {
    nutritionScore,
    additiveScore,
    organicBonus,
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
    nutriscore: ['a', 'b', 'c', 'd', 'e'].includes(effectiveGrade) ? effectiveGrade : 'unknown',
    nova,
    additiveFlags,
    version: 5,
  }
}

export function calculateQualityScore(product: OpenFoodFactsProduct): number {
  return calculateQualityBreakdown(product).qualityScore
}

export function scoreProduct(product: OpenFoodFactsProduct): ScoringResult {
  const breakdown = calculateQualityBreakdown(product)

  let confidence = product.ingredients_text ? 97 : 78
  let warning: string | null = null

  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const freshProduce = isFreshProduce(categories)
  if (!product.nova_group && freshProduce) {
    confidence = 60
    warning = 'Score estimated — this product has limited data in our database'
  }

  return {
    nova_score: breakdown.nova,
    quality_score: breakdown.qualityScore,
    quality_breakdown: breakdown,
    confidence,
    warning,
    is_fresh_produce: freshProduce,
  }
}

// ---------------------------------------------------------------------------
// Display helpers — score is now 0-100 natively
// ---------------------------------------------------------------------------

/** Score colors: >=70 green, >=45 amber, <45 red */
export function getScoreColor(score: number): string {
  if (score >= 70) return '#3d8c5e'
  if (score >= 45) return '#c8763a'
  return '#c0392b'
}

/** Verdict labels: Excellent/Good/Fair/Poor/Bad */
export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 45) return 'Fair'
  if (score >= 25) return 'Poor'
  return 'Bad'
}

/** Display score — score is already 0-100, just round it. */
export function getDisplayScore(score: number | null | undefined): number {
  if (score == null) return 0
  return Math.round(score)
}

/**
 * Get the effective 0-100 display score from a product row.
 * Prefers quality_score_v3 (new column) when populated;
 * falls back to quality_score × 10 (v2 original on 0-10 scale).
 * This lets the UI show correct scores during the transition while
 * the re-import populates v3 columns row by row.
 */
export function getEffectiveScore(product: {
  quality_score_v3?: number | null
  quality_score?: number | null
}): number {
  if (typeof product.quality_score_v3 === 'number') {
    return Math.round(product.quality_score_v3)
  }
  if (typeof product.quality_score === 'number') {
    return Math.round(product.quality_score * 10)
  }
  return 0
}

/** CSS class based on score thresholds: <45 poor, <70 fair, >=70 good */
export function getScoreClass(
  score: number | null | undefined,
): 'score-good' | 'score-fair' | 'score-poor' {
  if (score == null || score < 45) return 'score-poor'
  if (score < 70) return 'score-fair'
  return 'score-good'
}

// ---------------------------------------------------------------------------
// NOVA display helpers (unchanged)
// ---------------------------------------------------------------------------

export function getNovaColor(nova: number): string {
  if (nova <= 2) return '#22c77e'
  return '#f5a623'
}

export function getNovaEmoji(nova: number): string {
  switch (nova) {
    case 1: return '\u{1F33F}'   // leaf
    case 2: return '\u{1F9C2}'   // salt
    case 3: return '\u2699\uFE0F' // gear
    case 4: return '\u{1F3ED}'   // factory
    default: return '\u2753'     // question mark
  }
}

export function getNovaLabel(nova: number): string {
  switch (nova) {
    case 1: return 'Whole Food'
    case 2: return 'Culinary Ingredient'
    case 3: return 'Processed Food'
    case 4: return 'Industrially Processed'
    default: return 'Unknown'
  }
}

export function getNovaSublabel(nova: number): string {
  switch (nova) {
    case 1: return 'Unprocessed or minimally processed'
    case 2: return 'Oils, flour, salt, sugar'
    case 3: return 'Modified but recognisable'
    case 4: return 'Contains industrial ingredients'
    default: return ''
  }
}

export function getNovaDescription(nova: number): string {
  switch (nova) {
    case 1: return 'This food is in its natural state or has had minimal processing such as drying, freezing, or pasteurisation.'
    case 2: return 'A basic ingredient used in cooking. Rarely eaten alone — used to prepare and season whole foods.'
    case 3: return 'Made by adding salt, sugar, or oil to whole foods. Typically 2-3 ingredients. Examples: canned fish, cheese, cured meats.'
    case 4: return "Made using industrial processes and ingredients not found in home kitchens. This doesn't mean it's harmful — it means it's highly engineered."
    default: return ''
  }
}

// ---------------------------------------------------------------------------
// Fresh produce detection
// ---------------------------------------------------------------------------

const FRESH_PRODUCE_CATEGORIES = [
  'en:fresh-fruits', 'en:fruits', 'en:fresh-vegetables', 'en:vegetables',
  'en:fresh-produce', 'en:whole-foods', 'en:eggs', 'en:fresh-meat',
  'en:fish', 'en:fresh-fish', 'en:dairy', 'en:plain-yogurts',
  'en:butters', 'en:fresh-bread', 'en:nuts', 'en:seeds',
  'en:dried-fruits', 'en:legumes', 'en:cereals', 'en:rice', 'en:pasta',
]

function isFreshProduce(categories: string[]): boolean {
  return categories.some(cat =>
    FRESH_PRODUCE_CATEGORIES.some(
      fresh => cat.toLowerCase() === fresh.toLowerCase(),
    ),
  )
}

// ---------------------------------------------------------------------------
// Additive resolution (kept for backward-compat — used by scan route & UI)
// ---------------------------------------------------------------------------

export const ADDED_NUTRIENTS = [
  'POTASSIUM IODIDE', 'POTASSIUM-IODIDE', 'SODIUM FLUORIDE',
  'FERROUS SULPHATE', 'FERROUS FUMARATE', 'ZINC SULPHATE',
  'ZINC OXIDE', 'COPPER SULPHATE', 'MANGANESE SULPHATE',
  'SODIUM SELENATE', 'CHROMIUM CHLORIDE', 'SODIUM MOLYBDATE',
  'VITAMIN A ACETATE', 'RETINYL ACETATE', 'RETINYL PALMITATE',
  'THIAMINE', 'RIBOFLAVIN', 'PYRIDOXINE', 'CYANOCOBALAMIN',
  'ASCORBIC ACID', 'CHOLECALCIFEROL', 'DL-ALPHA-TOCOPHEROL',
  'PHYLLOQUINONE', 'FOLIC ACID', 'BIOTIN', 'NIACIN', 'NICOTINAMIDE',
  'PANTOTHENIC ACID', 'CALCIUM PANTOTHENATE', 'L-CARNITINE',
  'TAURINE', 'CHOLINE', 'INOSITOL', 'LUTEIN', 'LYCOPENE',
]

export function normaliseENumber(code: string): string {
  return code
    .toUpperCase()
    .trim()
    .replace(/\([ivxIVX\d]+\)/g, '')
    .replace(/[IVXivx]+$/, '')
    .replace(/[a-z]$/, '')
    .replace(/\s+/g, '')
    .trim()
}

export function isAddedNutrient(name: string): boolean {
  const upper = name.toUpperCase().replace(/-/g, ' ').trim()
  return ADDED_NUTRIENTS.some(n => upper.includes(n.replace(/-/g, ' ')))
}

export function resolveAdditives(additiveTags: string[]): Array<{
  code: string
  name: string
  risk: 'low' | 'medium' | 'high'
  tier: 0 | 1 | 2 | 3
  description: string
  regulation?: string
  function?: string
  detailed_description?: string
  potential_risks?: string[]
  sources?: Array<{ title: string; url: string; year: number }>
  uk_status?: string | null
  eu_status?: string | null
  us_status?: string | null
  uk_notes?: string | null
  divergence_alert?: boolean
}> {
  // Normalise, deduplicate, and filter out nutrients
  const normalised = additiveTags
    .map(tag => normaliseENumber(tag.replace('en:', '')))
    .filter(code => code.startsWith('E'))
    .filter(code => !isAddedNutrient(code))
  const unique = normalised.filter((v, i, a) => a.indexOf(v) === i)

  // Risk label comes from the tier registry — single source of truth shared
  // with the scorer, so UI badges always match the additive pillar.
  const tierToRisk = (tier: 0 | 1 | 2 | 3): 'low' | 'medium' | 'high' =>
    tier === 3 ? 'high' : tier === 2 ? 'medium' : 'low'

  return unique
    .map(code => {
      const tier = getTier(`en:${code.toLowerCase()}`)
      const risk = tierToRisk(tier)
      const match = additiveDatabase.find(
        a => a.code.toLowerCase() === code.toLowerCase(),
      )
      if (match) {
        return { ...match, risk, tier }
      }
      return {
        code,
        name: code,
        risk,
        tier,
        function: 'Additive',
        description: `${code} is a permitted food additive under EU/UK Regulation 1333/2008.`,
        detailed_description: `${code} is a permitted food additive authorised for use in the EU under Regulation 1333/2008 and in the UK under retained EU law. All permitted additives have undergone safety assessments by EFSA. Detailed information for this specific additive is being added to our database.`,
        potential_risks: [],
        sources: [
          { title: 'EU Regulation 1333/2008 on food additives', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R1333', year: 2008 },
          { title: 'EFSA — Food Additives', url: 'https://www.efsa.europa.eu/en/topics/topic/food-additives', year: 2024 },
          { title: 'UK FSA — Approved Additives and E Numbers', url: 'https://www.food.gov.uk/safety-hygiene/food-additives', year: 2024 },
          { title: 'US FDA — Food Additive Status List', url: 'https://www.fda.gov/food/food-additives-petitions/food-additive-status-list', year: 2024 },
        ],
        uk_status: 'permitted',
        eu_status: 'permitted',
        us_status: 'permitted',
      }
    })
    // Worst-first so the UI naturally shows the riskiest additives at the top
    .sort((a, b) => b.tier - a.tier)
}

export function resolveAddedNutrients(additiveTags: string[]): string[] {
  return additiveTags
    .map(tag => tag.replace('en:', '').toUpperCase().replace(/^E-/, 'E').trim())
    .filter(name => isAddedNutrient(name))
    .map(name => name.replace(/-/g, ' '))
    .filter((v, i, a) => a.indexOf(v) === i)
}
