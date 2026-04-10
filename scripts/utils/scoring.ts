import type { RawProduct, ProcessedProduct } from '../types/product'
// Single source of truth: delegate to the same scoring used by the live scan
// path. Version 3 — Yuka-aligned 3-pillar formula (0-100 scale).
import { scoreProduct } from '../../lib/scoring'

export function processProduct(raw: RawProduct): ProcessedProduct {
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
  }
}
