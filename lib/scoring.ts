import additiveDatabase from '@/data/additives.json'

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

const FRESH_PRODUCE_CATEGORIES = [
  'en:fresh-fruits', 'en:fruits', 'en:fresh-vegetables', 'en:vegetables',
  'en:fresh-produce', 'en:whole-foods', 'en:eggs', 'en:fresh-meat',
  'en:fish', 'en:fresh-fish', 'en:dairy', 'en:plain-yogurts',
  'en:butters', 'en:fresh-bread', 'en:nuts', 'en:seeds',
  'en:dried-fruits', 'en:legumes', 'en:cereals', 'en:rice', 'en:pasta',
]

const NATURAL_ADDITIVES = ['e300', 'e330', 'e270', 'e322', 'e160']

const NOVA4_MARKERS = [
  'en:flavouring', 'en:flavourings', 'en:artificial-sweeteners',
  'en:colours', 'en:emulsifiers', 'en:artificial-flavourings',
]

const NOVA3_MARKERS = [
  'en:preservative', 'en:preservatives', 'en:stabiliser',
  'en:stabilisers', 'en:thickener', 'en:thickeners',
]

const NOVA4_INGREDIENT_INDICATORS = [
  'hydrogenated', 'high-fructose', 'maltodextrin', 'dextrose',
  'modified starch', 'invert sugar', 'protein isolate',
  'mechanically separated',
]

export type QualityScoreBreakdown = {
  nutritional: number    // 0-5.0
  processing: number     // 0-2.5
  additives: number      // 0-2.0
  organic: number        // 0-0.5
  total: number          // 0-10.0
  nutriscore: string     // A-E or 'unknown'
  nova: number
  version: number
}

export type ScoringResult = {
  nova_score: number
  quality_score: number
  quality_breakdown: QualityScoreBreakdown
  confidence: number
  warning: string | null
  is_fresh_produce: boolean
}

function isFreshProduce(categories: string[]): boolean {
  return categories.some(cat =>
    FRESH_PRODUCE_CATEGORIES.some(fresh => cat.toLowerCase() === fresh.toLowerCase())
  )
}

function hasOnlyNaturalAdditives(additives: string[]): boolean {
  return additives.every(tag => {
    const code = tag.replace('en:', '').toLowerCase().replace(/^e-/, 'e')
    return NATURAL_ADDITIVES.some(nat => code.includes(nat))
  })
}

function hasNova4Markers(additives: string[]): boolean {
  return additives.some(tag =>
    NOVA4_MARKERS.some(marker => tag.toLowerCase().includes(marker))
  )
}

function hasNova3Markers(additives: string[]): boolean {
  return additives.some(tag =>
    NOVA3_MARKERS.some(marker => tag.toLowerCase().includes(marker))
  )
}

export function inferNovaScore(product: OpenFoodFactsProduct): number {
  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const additives = product.additives_tags || []
  const ingredients = (product.ingredients_text || '').toLowerCase()

  // 1. Fresh produce override — always NOVA 1
  if (isFreshProduce(categories)) {
    return 1
  }

  // 2. Use OFF nova_group if available AND product is not fresh produce
  if (product.nova_group && product.nova_group >= 1 && product.nova_group <= 4) {
    return product.nova_group
  }

  // 3. Inference fallback
  if (!additives.length || additives.length === 0) {
    // No additives at all → NOVA 1
    return 1
  }

  if (hasOnlyNaturalAdditives(additives)) {
    return 2
  }

  if (hasNova4Markers(additives)) {
    return 4
  }

  if (hasNova3Markers(additives)) {
    return 3
  }

  // Check ingredient text for ultra-processed markers
  if (NOVA4_INGREDIENT_INDICATORS.some(ind => ingredients.includes(ind))) {
    return 4
  }

  // Additives present but not clearly ultra-processed
  return 3
}

// --- BEVERAGE DETECTION ---
const BEVERAGE_CATEGORIES = [
  'en:beverages', 'en:drinks', 'en:soft-drinks', 'en:juices',
  'en:waters', 'en:energy-drinks', 'en:fruit-juices', 'en:sodas',
  'en:mineral-waters', 'en:iced-teas',
]

function isBeverage(categories: string[]): boolean {
  return categories.some(c => BEVERAGE_CATEGORIES.includes(c))
}

// --- NUTRI-SCORE CALCULATION ---
function pointsFromThresholds(value: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i
  }
  return thresholds.length
}

function calculateNutriScoreFromData(
  nutriments: Record<string, number>,
  beverage: boolean
): { grade: string; points: number } {
  const energy_kj = (nutriments['energy_100g'] || nutriments['energy-kcal_100g'] || 0) * 4.184
  const sat_fat = nutriments['saturated-fat_100g'] || 0
  const sugars = nutriments['sugars_100g'] || 0
  const sodium_mg = (nutriments['sodium_100g'] || (nutriments['salt_100g'] || 0) * 400) * 1000
  const fibre = nutriments['fiber_100g'] || nutriments['fibre_100g'] || 0
  const protein = nutriments['proteins_100g'] || 0

  // Negative points
  const energy_pts = pointsFromThresholds(energy_kj, [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350])
  const sat_pts = pointsFromThresholds(sat_fat, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

  let sugar_pts: number
  if (beverage) {
    sugar_pts = sugars <= 0 ? 0 : sugars <= 1 ? 1 : sugars <= 2 ? 2 : sugars <= 5 ? 3 : sugars <= 7.5 ? 5 : sugars <= 10 ? 7 : 10
  } else {
    sugar_pts = pointsFromThresholds(sugars, [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45])
  }

  const sodium_pts = pointsFromThresholds(sodium_mg, [90, 180, 270, 360, 450, 540, 630, 720, 810, 900])

  const negative = energy_pts + sat_pts + sugar_pts + sodium_pts

  // Positive points
  const fibre_pts = fibre < 0.9 ? 0 : fibre < 1.9 ? 1 : fibre < 2.8 ? 2 : fibre < 3.7 ? 3 : fibre < 4.7 ? 4 : 5
  const protein_pts = protein < 1.6 ? 0 : protein < 3.2 ? 1 : protein < 4.8 ? 2 : protein < 6.4 ? 3 : protein < 8.0 ? 4 : 5
  const fruit_veg_pts = 0 // Cannot determine from OFF data reliably

  const positive = fibre_pts + protein_pts + fruit_veg_pts

  let total: number
  if (negative >= 11 && fruit_veg_pts < 5) {
    total = negative - fibre_pts - fruit_veg_pts
  } else {
    total = negative - positive
  }

  // Grade
  let grade: string
  if (beverage) {
    grade = total <= 1 ? 'a' : total <= 5 ? 'b' : total <= 9 ? 'c' : total <= 13 ? 'd' : 'e'
  } else {
    grade = total <= -1 ? 'a' : total <= 2 ? 'b' : total <= 10 ? 'c' : total <= 18 ? 'd' : 'e'
  }

  return { grade, points: total }
}

// --- COMPONENT 1: NUTRITIONAL QUALITY (50%) ---
function calcNutritionalComponent(product: OpenFoodFactsProduct): { score: number; grade: string } {
  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const beverage = isBeverage(categories)

  // Use OFF nutri-score if available
  let grade = (product.nutriscore_grade || '').toLowerCase()

  // If not available, calculate from nutriments
  if (!grade || !['a', 'b', 'c', 'd', 'e'].includes(grade)) {
    const nutriments = product.nutriments || {}
    const hasData = nutriments['energy-kcal_100g'] || nutriments['sugars_100g'] || nutriments['fat_100g']
    if (hasData) {
      const calc = calculateNutriScoreFromData(nutriments, beverage)
      grade = calc.grade
    } else {
      return { score: 2.5, grade: 'unknown' } // Neutral when no data
    }
  }

  const GRADE_SCORES: Record<string, number> = { a: 5.0, b: 4.0, c: 3.0, d: 2.0, e: 1.0 }
  return { score: GRADE_SCORES[grade] || 2.5, grade }
}

// --- COMPONENT 2: PROCESSING LEVEL (25%) ---
function calcProcessingComponent(novaScore: number, isInferred: boolean): number {
  const NOVA_SCORES: Record<number, number> = { 1: 2.5, 2: 2.5, 3: 1.5, 4: 0.5 }
  let score = NOVA_SCORES[novaScore] ?? 1.5
  // Slightly less penalty for inferred NOVA 4
  if (novaScore === 4 && isInferred) score = 0.75
  return score
}

// --- COMPONENT 3: ADDITIVES (20%) ---
function calcAdditiveComponent(additiveTags: string[]): number {
  let score = 2.0
  const resolved = resolveAdditives(additiveTags)

  for (const add of resolved) {
    if (add.risk === 'high') score -= 0.4
    if (add.risk === 'medium') score -= 0.15

    // Southampton Six warning label penalty
    const warnCodes = ['E102', 'E104', 'E110', 'E122', 'E124', 'E129']
    if (warnCodes.includes(add.code.toUpperCase())) score -= 0.3

    // Formaldehyde releaser penalty
    const formaldehydeReleasers = ['E211']
    if (formaldehydeReleasers.includes(add.code.toUpperCase())) score -= 0.2
  }

  return Math.max(0, Math.min(2.0, score))
}

// --- COMPONENT 4: ORGANIC/CERTIFICATION (5%) ---
function calcOrganicComponent(labels: string[]): number {
  const lower = labels.map(l => l.toLowerCase())
  if (lower.some(l =>
    l.includes('organic') || l.includes('bio') ||
    l.includes('en:organic') || l.includes('en:eu-organic') ||
    l.includes('en:usda-organic') || l.includes('en:soil-association')
  )) {
    return 0.5
  }
  if (
    lower.some(l => l.includes('no-artificial-colours') || l.includes('no-artificial-flavours')) &&
    lower.some(l => l.includes('no-preservatives'))
  ) {
    return 0.25
  }
  return 0
}

// --- MAIN QUALITY SCORE ---
export function calculateQualityScore(product: OpenFoodFactsProduct): number {
  const breakdown = calculateQualityBreakdown(product)
  return breakdown.total
}

export function calculateQualityBreakdown(product: OpenFoodFactsProduct): QualityScoreBreakdown {
  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const freshProduce = isFreshProduce(categories)
  const novaScore = inferNovaScore(product)
  const isInferred = !product.nova_group

  // Calculate 4 components
  const nutritional = calcNutritionalComponent(product)
  const processing = calcProcessingComponent(novaScore, isInferred)
  const additives = calcAdditiveComponent(product.additives_tags || [])
  const organic = calcOrganicComponent(product.labels_tags || [])

  let total = nutritional.score + processing + additives + organic

  // Fresh produce floor
  if (freshProduce && total < 8.5) total = 8.5

  // Clamp
  total = Math.max(0, Math.min(10, total))
  total = Math.round(total * 10) / 10

  return {
    nutritional: Math.round(nutritional.score * 10) / 10,
    processing: Math.round(processing * 10) / 10,
    additives: Math.round(additives * 10) / 10,
    organic: Math.round(organic * 10) / 10,
    total,
    nutriscore: nutritional.grade,
    nova: novaScore,
    version: 2,
  }
}

export function scoreProduct(product: OpenFoodFactsProduct): ScoringResult {
  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const freshProduce = isFreshProduce(categories)
  const novaScore = inferNovaScore(product)
  const breakdown = calculateQualityBreakdown(product)

  let confidence = product.ingredients_text ? 97 : 78
  let warning: string | null = null

  // Low confidence if nova_group was null and product looks fresh
  if (!product.nova_group && freshProduce) {
    confidence = 60
    warning = 'Score estimated — this product has limited data in our database'
  }

  return {
    nova_score: novaScore,
    quality_score: breakdown.total,
    quality_breakdown: breakdown,
    confidence,
    warning,
    is_fresh_produce: freshProduce,
  }
}

export function getScoreColor(score: number): string {
  if (score < 4) return '#ff5a5a'     // red - Poor
  if (score < 5.5) return '#ff8c42'   // orange - Moderate
  if (score < 7) return '#f5a623'     // amber - Fair
  if (score < 8.5) return '#22c77e'   // green - Good
  return '#00e5a0'                     // bright green - Excellent
}

export function getScoreLabel(score: number): string {
  if (score < 4) return 'Poor'
  if (score < 5.5) return 'Moderate'
  if (score < 7) return 'Fair'
  if (score < 9) return 'Good'
  return 'Excellent'
}

export function getNovaColor(nova: number): string {
  if (nova <= 2) return '#22c77e'
  return '#f5a623'
}

export function getNovaEmoji(nova: number): string {
  switch (nova) {
    case 1: return '🌿'
    case 2: return '🧂'
    case 3: return '⚙️'
    case 4: return '🏭'
    default: return '❓'
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

export function detectFlags(product: OpenFoodFactsProduct): string[] {
  const flags: string[] = []
  const nutriments = product.nutriments || {}

  if ((nutriments['sugars_100g'] || 0) > 10) flags.push('High Sugar')
  if ((nutriments['sodium_100g'] || 0) > 0.6 || (nutriments['salt_100g'] || 0) > 1.5) flags.push('High Salt')
  if ((nutriments['saturated-fat_100g'] || 0) > 5) flags.push('High Saturated Fat')

  const additives = product.additives_tags || []
  const colorAdditives = ['e102', 'e104', 'e110', 'e122', 'e124', 'e129', 'e131', 'e133']
  if (additives.some(a => colorAdditives.some(c => a.toLowerCase().includes(c)))) {
    flags.push('Artificial Colours')
  }

  const sweetenerAdditives = ['e951', 'e950', 'e955', 'e954']
  if (additives.some(a => sweetenerAdditives.some(s => a.toLowerCase().includes(s)))) {
    flags.push('Artificial Sweeteners')
  }

  return flags
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
        a => a.code.toLowerCase() === code.toLowerCase()
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
