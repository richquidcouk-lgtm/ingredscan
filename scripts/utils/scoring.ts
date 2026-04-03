import type { RawProduct, ProcessedProduct } from '../types/product'

const NOVA4_ADDITIVE_PREFIXES = [
  'en:flavouring', 'en:colour', 'en:sweetener',
  'en:emulsifier', 'en:preservative', 'en:stabiliser',
  'en:thickener', 'en:anti-caking-agent',
]

export function inferNovaScore(product: RawProduct): number {
  if (product.nova_group && product.nova_group >= 1 && product.nova_group <= 4) {
    return product.nova_group
  }

  const additives = product.additives_tags || []

  if (additives.length === 0) {
    const ingredients = (product.ingredients || '').toLowerCase()
    const isSingleIngredient = !ingredients.includes(',') && ingredients.length < 50
    if (isSingleIngredient && ingredients.length > 0) return 1

    const culinaryIndicators = ['oil', 'butter', 'salt', 'sugar', 'flour', 'vinegar', 'honey']
    if (culinaryIndicators.some((ind) => ingredients.includes(ind))) return 2

    return 3
  }

  const hasNova4Indicators = additives.some((tag) =>
    NOVA4_ADDITIVE_PREFIXES.some((prefix) => tag.toLowerCase().startsWith(prefix))
  )

  return hasNova4Indicators ? 4 : 3
}

export function calculateQualityScore(product: RawProduct): number {
  let score = 10

  const additives = product.additives_tags || []
  const nova4Count = additives.filter((tag) =>
    NOVA4_ADDITIVE_PREFIXES.some((prefix) => tag.toLowerCase().startsWith(prefix))
  ).length
  score -= Math.min(nova4Count * 1.5, 4)

  const nutriscore = (product.nutriscore_grade || '').toLowerCase()
  if (nutriscore === 'd' || nutriscore === 'e') score -= 1
  else if (nutriscore === 'c') score -= 0.5

  const n = product.nutrition
  if (n.saturated_fat_100g && n.saturated_fat_100g > 5) score -= 1
  if (n.sugars_100g && n.sugars_100g > 10) score -= 0.5
  if (n.salt_100g && n.salt_100g > 0.6) score -= 1

  if (product.is_organic) score += 0.5

  score = Math.max(0, Math.min(10, score))
  return Math.round(score * 10) / 10
}

export function processProduct(raw: RawProduct): ProcessedProduct {
  const novaScore = inferNovaScore(raw)
  const qualityScore = calculateQualityScore(raw)

  const isUK = raw.countries_tags?.some(
    (c) => c.includes('united-kingdom') || c.includes('en:united-kingdom')
  )

  return {
    ...raw,
    nova_group: novaScore,
    quality_score: qualityScore,
    data_source: isUK ? 'Open Food Facts + UK FSA' : `Open Food Facts + USDA`,
    confidence: raw.name && raw.ingredients ? 97 : 78,
    last_imported_at: new Date().toISOString(),
  }
}
