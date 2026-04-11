import { supabaseAdmin } from './supabaseAdmin'
import type { ProcessedProduct } from '../types/product'
import { SOURCE_PRIORITY } from '../types/product'
import type { Logger } from 'pino'

const BATCH_SIZE = 100

export async function batchUpsert(
  products: ProcessedProduct[],
  options: { dryRun: boolean },
  logger: Logger
): Promise<{ success: number; failed: number }> {
  if (options.dryRun) {
    logger.info({ count: products.length }, 'Dry run — skipping insert')
    return { success: products.length, failed: 0 }
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)

    // Check existing products to respect source priority
    const barcodes = batch.map((p) => p.barcode)
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('barcode, import_source')
      .in('barcode', barcodes)

    const existingMap = new Map(
      (existing || []).map((e: any) => [e.barcode, e.import_source])
    )

    const toUpsert = batch.filter((product) => {
      const existingSource = existingMap.get(product.barcode)
      if (!existingSource) return true

      const existingPriority = SOURCE_PRIORITY[existingSource] || 0
      const newPriority = SOURCE_PRIORITY[product.import_source] || 0
      return newPriority >= existingPriority
    })

    if (toUpsert.length === 0) {
      logger.debug({ batch: i / BATCH_SIZE }, 'All products skipped due to lower priority')
      continue
    }

    const now = new Date().toISOString()
    const rows = toUpsert.map((p) => {
      const isCosmetic = p.product_type === 'cosmetic'
      const row: Record<string, unknown> = {
        barcode: p.barcode,
        name: p.name,
        brand: p.brand,
        product_type: p.product_type || 'food',
        // IngredScan-computed NOVA (passthrough when OFF supplied one, otherwise
        // inferred). The raw OFF NOVA is preserved separately in off_nova_group.
        nova_score: p.nova_group,
        nova_source: p.nova_source,
        off_nova_group: p.off_nova_group,
        // Scores go into dedicated v3 columns — the original quality_score is
        // NEVER overwritten so the v2 data is preserved for traceability. For
        // cosmetics the pillar columns stay null; the composite lives in
        // quality_score_v3 scaled to 0-100.
        quality_score_v3: p.quality_score,
        nutrition_score_v3: isCosmetic
          ? null
          : (p.quality_score_breakdown as any)?.nutritionScore ?? null,
        additive_score_v3: isCosmetic
          ? null
          : (p.quality_score_breakdown as any)?.additiveScore ?? null,
        organic_bonus_v3: isCosmetic
          ? null
          : (p.quality_score_breakdown as any)?.organicBonus ?? null,
        quality_score_version: p.quality_score_version,
        quality_score_breakdown: p.quality_score_breakdown,
        quality_score_updated_at: now,
        nutriscore_grade: p.nutriscore_grade || '',
        ingredients: p.ingredients,
        additives: isCosmetic ? [] : resolveAdditives(p.additives_tags),
        nutrition: isCosmetic
          ? null
          : {
              energy: p.nutrition.energy_100g,
              fat: p.nutrition.fat_100g,
              saturated_fat: p.nutrition.saturated_fat_100g,
              carbs: p.nutrition.carbohydrates_100g,
              sugars: p.nutrition.sugars_100g,
              fibre: p.nutrition.fiber_100g,
              protein: p.nutrition.proteins_100g,
              salt: p.nutrition.salt_100g,
            },
        image_url: p.image_url || '',
        data_source: p.data_source,
        confidence: p.confidence,
        category: (p.categories_tags || []).join(', '),
        categories_tags: p.categories_tags,
        labels_tags: p.labels_tags,
        is_organic: p.is_organic,
        retailer_availability: p.retailer_availability,
        avg_price: p.avg_price,
        import_source: p.import_source,
        country: p.country,
        last_imported_at: p.last_imported_at,
        updated_at: now,
      }

      if (isCosmetic) {
        row.inci_ingredients = p.inci_ingredients ?? null
        row.cosmetic_concerns = p.cosmetic_concerns ?? null
        row.is_vegan = p.is_vegan ?? null
        row.is_cruelty_free = p.is_cruelty_free ?? null
        row.is_natural = p.is_natural ?? null
        row.fragrance_free = p.fragrance_free ?? null
        row.alcohol_free = p.alcohol_free ?? null
        row.paraben_free = p.paraben_free ?? null
        row.sulphate_free = p.sulphate_free ?? null
        row.silicone_free = p.silicone_free ?? null
        row.ewg_score = p.ewg_score ?? null
      }

      return row
    })

    const { error } = await supabaseAdmin
      .from('products')
      .upsert(rows, { onConflict: 'barcode' })

    if (error) {
      logger.error({ error: error.message, batch: i / BATCH_SIZE }, 'Batch upsert failed')
      failed += toUpsert.length
    } else {
      success += toUpsert.length
    }
  }

  return { success, failed }
}

function resolveAdditives(tags: string[]): any[] {
  // Lightweight additive resolution for import — full resolution happens at scan time
  return tags.map((tag) => {
    const code = tag.replace('en:', '').toUpperCase().replace(/^E-/, 'E')
    return { code, name: code, risk: 'low', description: '' }
  })
}
