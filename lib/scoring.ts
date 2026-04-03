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

const NOVA4_INDICATORS = [
  'emulsifier', 'flavouring', 'flavoring', 'colour', 'color',
  'sweetener', 'preservative', 'hydrogenated', 'high-fructose',
  'maltodextrin', 'dextrose', 'modified starch', 'invert sugar',
  'protein isolate', 'mechanically separated'
]

const WHOLE_FOOD_CATEGORIES = [
  'fruits', 'vegetables', 'fresh-meats', 'eggs', 'milks',
  'nuts', 'seeds', 'legumes', 'fish', 'seafood'
]

const CULINARY_CATEGORIES = [
  'oils', 'butter', 'salt', 'sugar', 'flour', 'vinegar',
  'honey', 'spices', 'herbs'
]

export function inferNovaScore(product: OpenFoodFactsProduct): number {
  if (product.nova_group && product.nova_group >= 1 && product.nova_group <= 4) {
    return product.nova_group
  }

  const categories = (product.categories_tags || []).map(c => c.toLowerCase())
  const ingredients = (product.ingredients_text || '').toLowerCase()
  const additives = product.additives_tags || []

  if (WHOLE_FOOD_CATEGORIES.some(cat => categories.some(c => c.includes(cat)))) {
    return 1
  }

  if (CULINARY_CATEGORIES.some(cat => categories.some(c => c.includes(cat)))) {
    return 2
  }

  if (additives.length > 0) {
    return 4
  }

  if (NOVA4_INDICATORS.some(ind => ingredients.includes(ind))) {
    return 4
  }

  return 3
}

export function calculateQualityScore(product: OpenFoodFactsProduct): number {
  let score = 10

  const additives = product.additives_tags || []
  const nova4AdditiveCount = additives.length
  score -= Math.min(nova4AdditiveCount * 1.5, 4)

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
  return Math.round(score * 10) / 10
}

export function getScoreColor(score: number): string {
  if (score < 4.5) return '#ff5a5a'
  if (score <= 7) return '#f5a623'
  return '#00e5a0'
}

export function getScoreLabel(score: number): string {
  if (score < 4.5) return 'Poor'
  if (score <= 7) return 'Moderate'
  return 'Good'
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
        description: 'Information not yet available for this additive.',
      }
    })
}
