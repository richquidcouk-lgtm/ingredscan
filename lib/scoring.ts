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
// Quality Score Breakdown — version 3 (Yuka-aligned 3-pillar formula)
// Score is natively 0-100. NOVA has zero influence on the quality score.
// ---------------------------------------------------------------------------

export type QualityScoreBreakdown = {
  nutritionScore: number   // 0-100
  additiveScore: number    // 0-100
  organicBonus: number     // 0 or 100
  qualityScore: number     // 0-100 (weighted composite)
  nutriscore: string       // a-e or 'unknown'
  nova: number             // 1-4 (display only)
  version: number          // 3
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
// Pillar 1 — Nutrition Score (60% weight)
// ---------------------------------------------------------------------------

function calcNutritionScore(
  nutriments: Record<string, number>,
  nutriscoreGrade: string,
): number {
  const grade = nutriscoreGrade.toLowerCase()
  const base = NUTRISCORE_BASE[grade] ?? 50 // missing → neutral 50

  const proteinBonus  = Math.min(20, (nutriments['proteins_100g']       ?? 0) * 0.5)
  const fibreBonus    = Math.min(15, (nutriments['fiber_100g']          ?? 0) * 1.5)
  const sugarPenalty  = Math.min(30, (nutriments['sugars_100g']         ?? 0) * 0.6)
  const satFatPenalty = Math.min(10, (nutriments['saturated-fat_100g']  ?? 0) * 1.2)
  const saltPenalty   = Math.min(10, (nutriments['salt_100g']           ?? 0) * 8.0)

  let score = Math.round(
    (base * 0.5) + proteinBonus + fibreBonus
    - sugarPenalty - satFatPenalty - saltPenalty
  )
  score = Math.max(0, Math.min(100, score))

  // Yuka hard cap: Nutriscore D or E → max 49
  if (grade === 'd' || grade === 'e') {
    score = Math.min(score, 49)
  }

  return score
}

// ---------------------------------------------------------------------------
// Pillar 2 — Additive Score (30% weight)
// ---------------------------------------------------------------------------

function calcAdditiveScore(additiveTags: string[]): number {
  let penalty = 0
  let maxTier = 0

  for (const tag of additiveTags) {
    const tier = getTier(tag)
    maxTier = Math.max(maxTier, tier)
    if (tier === 3) penalty += 30
    else if (tier === 2) penalty += 15
    else if (tier === 1) penalty += 5
  }

  let score = Math.max(0, Math.min(100, 100 - penalty))

  // Yuka hard caps
  if (maxTier >= 3) score = Math.min(score, 49)
  else if (maxTier >= 2) score = Math.min(score, 75)

  return score
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

  const nutritionScore = calcNutritionScore(nutriments, grade)
  const additiveScore = calcAdditiveScore(product.additives_tags || [])
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
    nutriscore: ['a', 'b', 'c', 'd', 'e'].includes(grade) ? grade : 'unknown',
    nova,
    version: 3,
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
  description: string
  regulation?: string
  function?: string
  detailed_description?: string
  potential_risks?: string[]
  sources?: Array<{ title: string; url: string; year: number }>
}> {
  // Normalise, deduplicate, and filter out nutrients
  const normalised = additiveTags
    .map(tag => normaliseENumber(tag.replace('en:', '')))
    .filter(code => code.startsWith('E'))
    .filter(code => !isAddedNutrient(code))
  const unique = normalised.filter((v, i, a) => a.indexOf(v) === i)

  return unique
    .map(code => {
      const match = additiveDatabase.find(
        a => a.code.toLowerCase() === code.toLowerCase(),
      )
      if (match) {
        return { ...match, risk: match.risk as 'low' | 'medium' | 'high' }
      }
      return {
        code,
        name: code,
        risk: 'low' as const,
        function: 'Additive',
        description: `${code} is a permitted food additive under EU Regulation 1333/2008.`,
        detailed_description: `${code} is a permitted food additive authorised for use in the EU under Regulation 1333/2008 and in the UK under retained EU law. All permitted additives have undergone safety assessments by EFSA. Detailed information for this specific additive is being added to our database.`,
        potential_risks: [],
        sources: [{ title: 'EU Regulation 1333/2008 on food additives', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008R1333', year: 2008 }],
      }
    })
}

export function resolveAddedNutrients(additiveTags: string[]): string[] {
  return additiveTags
    .map(tag => tag.replace('en:', '').toUpperCase().replace(/^E-/, 'E').trim())
    .filter(name => isAddedNutrient(name))
    .map(name => name.replace(/-/g, ' '))
    .filter((v, i, a) => a.indexOf(v) === i)
}
