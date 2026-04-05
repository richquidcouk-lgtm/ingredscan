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

export type ScoringResult = {
  nova_score: number
  quality_score: number
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

export function calculateQualityScore(product: OpenFoodFactsProduct): number {
  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const freshProduce = isFreshProduce(categories)

  let score = 10

  const additives = product.additives_tags || []
  // Only deduct for non-natural additives
  const nonNaturalCount = additives.filter(tag => {
    const code = tag.replace('en:', '').toLowerCase().replace(/^e-/, 'e')
    return !NATURAL_ADDITIVES.some(nat => code.includes(nat))
  }).length
  score -= Math.min(nonNaturalCount * 1.5, 4)

  const nutriscore = (product.nutriscore_grade || '').toLowerCase()
  if (nutriscore === 'd' || nutriscore === 'e') {
    score -= 1
  } else if (nutriscore === 'c') {
    score -= 0.5
  }

  const nutriments = product.nutriments || {}
  if ((nutriments['saturated-fat_100g'] || 0) > 5) {
    score -= 1
  }
  if ((nutriments['sugars_100g'] || 0) > 10) {
    score -= 0.5
  }
  if ((nutriments['sodium_100g'] || 0) > 0.6) {
    score -= 1
  }

  const labels = (product.labels_tags || []).map(l => l.toLowerCase())
  if (labels.some(l => l.includes('organic') || l.includes('bio'))) {
    score += 0.5
  }

  score = Math.max(0, Math.min(10, score))

  // Fresh produce minimum score
  if (freshProduce && score < 8.0) {
    score = 8.0
  }

  // NOVA ceiling — ultra-processed products can't score too high
  const novaScore = inferNovaScore(product)
  const NOVA_CEILING: Record<number, number> = { 1: 10, 2: 10, 3: 8, 4: 6.5 }
  const ceiling = NOVA_CEILING[novaScore] ?? 10
  score = Math.min(score, ceiling)

  return Math.round(score * 10) / 10
}

export function scoreProduct(product: OpenFoodFactsProduct): ScoringResult {
  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const freshProduce = isFreshProduce(categories)
  const novaScore = inferNovaScore(product)
  const qualityScore = calculateQualityScore(product)

  let confidence = product.ingredients_text ? 97 : 78
  let warning: string | null = null

  // Low confidence if nova_group was null and product looks fresh
  if (!product.nova_group && freshProduce) {
    confidence = 60
    warning = 'Score estimated — this product has limited data in our database'
  }

  return {
    nova_score: novaScore,
    quality_score: qualityScore,
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
  if (score < 8.5) return 'Good'
  return 'Excellent'
}

export function getNovaColor(nova: number): string {
  if (nova <= 2) return '#00e5a0'
  if (nova === 3) return '#f5a623'
  return '#ff5a5a'
}

export function getNovaEmoji(nova: number): string {
  switch (nova) {
    case 1: return '🌿'
    case 2: return '🌾'
    case 3: return '⚠️'
    case 4: return '🚨'
    default: return '❓'
  }
}

export function getNovaLabel(nova: number): string {
  switch (nova) {
    case 1: return 'Unprocessed'
    case 2: return 'Processed Ingredients'
    case 3: return 'Processed'
    case 4: return 'Ultra-Processed'
    default: return 'Unknown'
  }
}

export function detectFlags(product: OpenFoodFactsProduct, novaScore: number): string[] {
  const flags: string[] = []
  const nutriments = product.nutriments || {}

  if (novaScore === 4) flags.push('Ultra-Processed')
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
}> {
  return additiveTags
    .map(tag => {
      const code = tag.replace('en:', '').toUpperCase().replace(/^E-/, 'E')
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
        description: `${code} is a permitted food additive under EU Regulation 1333/2008. Detailed information is being added to our database.`,
      }
    })
}
