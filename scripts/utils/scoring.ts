import type { RawProduct, ProcessedProduct } from '../types/product'
// Single source of truth: delegate to the same scoring used by the live scan
// path. Food products use lib/scoring (Yuka-aligned 3-pillar formula v4);
// cosmetic products use lib/cosmeticScoring (INCI-based safety score).
import { scoreProduct } from '../../lib/scoring'
import { calculateCosmeticScore } from '../../lib/cosmeticScoring'
import {
  parseInciIngredients,
  matchCosmeticIngredients,
} from '../../lib/openBeautyFacts'

const COSMETIC_CATEGORY_HINTS = [
  'en:cosmetics', 'en:beauty', 'en:skin-care', 'en:hair-care',
  'en:makeup', 'en:perfumes', 'en:shampoos', 'en:shower-gels',
  'en:face-creams', 'en:body-lotions', 'en:sunscreens',
  'en:deodorants', 'en:toothpastes', 'en:lip-care', 'en:nail-polish',
]

function isCosmetic(raw: RawProduct): boolean {
  if (raw.import_source === 'openbeautyfacts') return true
  const cats = (raw.categories_tags || []).map((c) => c.toLowerCase())
  return cats.some((c) => COSMETIC_CATEGORY_HINTS.includes(c))
}

/**
 * Label-based cosmetic flag detection. Lives here (rather than using
 * detectCosmeticFlags from lib/openBeautyFacts) because that helper expects an
 * OBFProduct and we work with RawProduct at import time.
 */
function detectCosmeticFlagsFromRaw(raw: RawProduct) {
  const labels = (raw.labels_tags || []).map((l) => l.toLowerCase())
  const ingText = (raw.ingredients || '').toUpperCase()

  return {
    is_vegan: labels.some((l) => l.includes('vegan')),
    is_cruelty_free: labels.some(
      (l) => l.includes('cruelty-free') || l.includes('not tested on animals'),
    ),
    is_natural: labels.some(
      (l) => l.includes('natural') || l.includes('organic') || l.includes('bio'),
    ),
    fragrance_free:
      !ingText.includes('PARFUM') && !ingText.includes('FRAGRANCE'),
    alcohol_free:
      !ingText.includes('ALCOHOL DENAT') &&
      !ingText.includes('ETHANOL') &&
      !ingText.includes('ISOPROPYL ALCOHOL'),
    paraben_free: !ingText.includes('PARABEN'),
    sulphate_free:
      !ingText.includes('SODIUM LAURYL SULFATE') &&
      !ingText.includes('SODIUM LAURETH SULFATE'),
    silicone_free:
      !ingText.includes('DIMETHICONE') && !ingText.includes('SILOXANE'),
  }
}

function processCosmetic(raw: RawProduct): ProcessedProduct {
  const flags = detectCosmeticFlagsFromRaw(raw)
  const inciNames = parseInciIngredients(raw.ingredients || '')
  const matched = matchCosmeticIngredients(inciNames)
  const cosmeticScore = calculateCosmeticScore(flags, matched)

  // Cosmetic scorer returns 0-10; scale to 0-100 so the shared
  // quality_score_v3 / quality_score columns stay consistent across product
  // types. Pillar fields are cosmetic-specific rather than nutrition/additive.
  const score100 = Math.round(cosmeticScore.overallScore * 10)
  const breakdown: Record<string, unknown> = {
    type: 'cosmetic',
    overallScore: cosmeticScore.overallScore,
    safetyScore: cosmeticScore.safetyScore,
    transparencyScore: cosmeticScore.transparencyScore,
    label: cosmeticScore.label,
    concerns: cosmeticScore.concerns,
    highlights: cosmeticScore.highlights,
    flags: cosmeticScore.flags,
    ingredientCount: matched.length,
    version: 5,
  }

  const isUK = raw.countries_tags?.some(
    (c) => c.includes('united-kingdom') || c.includes('en:united-kingdom'),
  )

  return {
    ...raw,
    nova_group: 0, // NOVA is meaningless for cosmetics — stored as 0
    quality_score: score100,
    data_source: isUK ? 'Open Beauty Facts + UK' : 'Open Beauty Facts',
    confidence: matched.length > 0 ? 90 : 60,
    last_imported_at: new Date().toISOString(),
    off_nova_group: null,
    nova_source: 'inferred',
    quality_score_version: 5,
    quality_score_breakdown: breakdown,
    product_type: 'cosmetic',
    inci_ingredients: matched,
    cosmetic_concerns: cosmeticScore.concerns,
    is_vegan: flags.is_vegan,
    is_cruelty_free: flags.is_cruelty_free,
    is_natural: flags.is_natural,
    fragrance_free: flags.fragrance_free,
    alcohol_free: flags.alcohol_free,
    paraben_free: flags.paraben_free,
    sulphate_free: flags.sulphate_free,
    silicone_free: flags.silicone_free,
    ewg_score:
      matched
        .map((m) => m.ewg_score || 0)
        .reduce((a, b) => Math.max(a, b), 0) || null,
  }
}

export function processProduct(raw: RawProduct): ProcessedProduct {
  // Cosmetic products get scored via lib/cosmeticScoring — nutrient-based
  // scoring would give every beauty product a meaningless ~60 because they
  // have no nutriscore, no nutrients, and no E-number additives.
  if (isCosmetic(raw)) {
    return processCosmetic(raw)
  }

  // Adapt RawProduct → the OpenFoodFactsProduct shape lib/scoring expects.
  // lib/scoring reads nutriments via OFF-style flat keys (e.g.
  // `saturated-fat_100g`) so we map our nested nutrition object to that.
  const n = raw.nutrition
  const nutriments: Record<string, number> = {}
  if (n.energy_100g != null) nutriments['energy_100g'] = n.energy_100g
  if (n.fat_100g != null) nutriments['fat_100g'] = n.fat_100g
  if (n.saturated_fat_100g != null) nutriments['saturated-fat_100g'] = n.saturated_fat_100g
  if (n.carbohydrates_100g != null) nutriments['carbohydrates_100g'] = n.carbohydrates_100g
  if (n.sugars_100g != null) nutriments['sugars_100g'] = n.sugars_100g
  if (n.fiber_100g != null) nutriments['fiber_100g'] = n.fiber_100g
  if (n.proteins_100g != null) nutriments['proteins_100g'] = n.proteins_100g
  if (n.salt_100g != null) nutriments['salt_100g'] = n.salt_100g

  // Capture the raw OFF NOVA before lib/scoring potentially replaces it via
  // inference — we need to preserve the original for traceability.
  const offNovaGroup: number | null =
    raw.nova_group && raw.nova_group >= 1 && raw.nova_group <= 4 ? raw.nova_group : null

  const result = scoreProduct({
    nova_group: offNovaGroup ?? undefined,
    nutriscore_grade: raw.nutriscore_grade ?? undefined,
    additives_tags: raw.additives_tags || [],
    categories_tags: raw.categories_tags || [],
    labels_tags: raw.labels_tags || [],
    nutriments,
    ingredients_text: raw.ingredients,
  })

  const isUK = raw.countries_tags?.some(
    (c) => c.includes('united-kingdom') || c.includes('en:united-kingdom')
  )

  return {
    ...raw,
    nova_group: result.nova_score,
    quality_score: result.quality_score, // now 0-100
    data_source: isUK ? 'Open Food Facts + UK FSA' : 'Open Food Facts + USDA',
    confidence: result.confidence,
    last_imported_at: new Date().toISOString(),
    off_nova_group: offNovaGroup,
    nova_source: offNovaGroup != null ? 'off_direct' : 'inferred',
    quality_score_version: result.quality_breakdown.version,
    quality_score_breakdown: result.quality_breakdown as unknown as Record<string, unknown>,
    product_type: 'food',
  }
}
