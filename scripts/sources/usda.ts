import axios from 'axios'
import pLimit from 'p-limit'
import { createLogger } from '../utils/logger'
import { ProgressTracker, ImportLogger } from '../utils/progress'
import { processProduct } from '../utils/scoring'
import { batchUpsert } from '../utils/batchInsert'
import { RateLimiter } from '../utils/rateLimiter'
import { supabaseAdmin } from '../utils/supabaseAdmin'
import type { RawProduct, ProcessedProduct, ImportOptions } from '../types/product'

const logger = createLogger('usda')
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'

const NUTRIENT_MAP: Record<number, string> = {
  1008: 'energy_100g',
  1004: 'fat_100g',
  1258: 'saturated_fat_100g',
  1005: 'carbohydrates_100g',
  2000: 'sugars_100g',
  1079: 'fiber_100g',
  1003: 'proteins_100g',
  1093: 'sodium_100g', // Will convert to salt
}

function mapUSDAProduct(item: any): RawProduct | null {
  const barcode = item.gtinUpc?.trim()
  if (!barcode || !item.description) return null

  const nutrition: any = {
    energy_100g: null,
    fat_100g: null,
    saturated_fat_100g: null,
    carbohydrates_100g: null,
    sugars_100g: null,
    fiber_100g: null,
    proteins_100g: null,
    salt_100g: null,
  }

  for (const nutrient of item.foodNutrients || []) {
    const key = NUTRIENT_MAP[nutrient.nutrientId]
    if (key) {
      if (key === 'sodium_100g') {
        // Convert sodium (mg) to salt (g): salt = sodium * 2.5 / 1000
        nutrition.salt_100g = (nutrient.value || 0) * 2.5 / 1000
      } else {
        nutrition[key] = nutrient.value ?? null
      }
    }
  }

  return {
    barcode,
    name: item.description || '',
    brand: item.brandOwner || item.brandName || '',
    ingredients: item.ingredients || '',
    additives_tags: [],
    nova_group: null,
    nutriscore_grade: null,
    nutrition,
    image_url: null,
    categories_tags: item.brandedFoodCategory ? [item.brandedFoodCategory] : [],
    labels_tags: [],
    countries_tags: ['en:united-states'],
    is_organic: (item.description || '').toLowerCase().includes('organic'),
    import_source: 'usda',
    retailer_availability: [],
    avg_price: null,
    country: 'US',
  }
}

export async function importUSDA(options: ImportOptions): Promise<void> {
  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    logger.warn('USDA_API_KEY not set — skipping USDA import')
    return
  }

  logger.info('Starting USDA import')

  const progress = new ProgressTracker('usda')
  const importLog = new ImportLogger('usda')
  await importLog.start()

  const rateLimiter = new RateLimiter(0.27) // ~1000/hour = ~0.27/sec
  const limit = pLimit(15)

  let processed = 0
  let imported = 0
  let failed = 0
  let pageNumber = 1

  let resumeOffset = 0
  if (options.resume) {
    const checkpoint = await progress.load()
    if (checkpoint) {
      resumeOffset = checkpoint.offset
      pageNumber = Math.floor(resumeOffset / 50) + 1
      logger.info({ page: pageNumber }, 'Resuming from checkpoint')
    }
  }

  try {
    let hasMore = true

    while (hasMore) {
      if (options.limit > 0 && imported >= options.limit) break

      await rateLimiter.throttle()

      const response = await axios.get(`${USDA_BASE}/foods/search`, {
        params: {
          api_key: apiKey,
          dataType: 'Branded',
          pageSize: 50,
          pageNumber,
          sortBy: 'dataType.keyword',
          sortOrder: 'asc',
        },
        timeout: 30000,
      })

      const foods = response.data.foods || []
      if (foods.length === 0) {
        hasMore = false
        break
      }

      const batch: ProcessedProduct[] = []

      for (const item of foods) {
        processed++
        const raw = mapUSDAProduct(item)
        if (!raw) continue

        // Check if barcode already exists with higher priority source
        const { data: existing } = await supabaseAdmin
          .from('products')
          .select('import_source')
          .eq('barcode', raw.barcode)
          .single()

        if (existing && existing.import_source !== 'usda') continue

        batch.push(processProduct(raw))
      }

      if (batch.length > 0) {
        const result = await batchUpsert(batch, { dryRun: options.dryRun }, logger)
        imported += result.success
        failed += result.failed
      }

      await progress.save(foods[foods.length - 1]?.gtinUpc || '', processed)
      await importLog.update(processed, imported, failed)
      logger.info({ page: pageNumber, processed, imported, failed }, 'Progress')

      pageNumber++
      hasMore = foods.length === 50
    }

    await progress.complete()
    await importLog.finish('completed')
    logger.info({ processed, imported, failed }, 'USDA import completed')
  } catch (error: any) {
    logger.error({ error: error.message }, 'USDA import failed')
    await importLog.finish('failed')
    throw error
  }
}
