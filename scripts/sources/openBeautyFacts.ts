import axios from 'axios'
import * as zlib from 'zlib'
import * as readline from 'readline'
import { createLogger } from '../utils/logger'
import { ProgressTracker, ImportLogger } from '../utils/progress'
import { processProduct } from '../utils/scoring'
import { batchUpsert } from '../utils/batchInsert'
import { RateLimiter } from '../utils/rateLimiter'
import type { RawProduct, ProcessedProduct, ImportOptions } from '../types/product'

const logger = createLogger('openbeautyfacts')
const CSV_URL = 'https://world.openbeautyfacts.org/data/en.openbeautyfacts.org.products.csv.gz'
const API_BASE = 'https://world.openbeautyfacts.org/api/v0/product'

function parseNumber(val: any): number | null {
  if (val === '' || val === null || val === undefined) return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function csvRowToRawProduct(row: any): RawProduct | null {
  const barcode = row.code?.toString().trim()
  if (!barcode || !row.product_name?.trim()) return null

  const countriesTags = (row.countries_tags || '')
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean)
  // Cosmetic dataset is small (~64k globally) so we import everything,
  // not just UK. Country is set to UK if explicitly tagged, else 'Other'.
  const isUK = countriesTags.some(
    (c: string) => c === 'en:united-kingdom' || c === 'united-kingdom'
  )

  const labelsTags = (row.labels_tags || '').split(',').map((s: string) => s.trim())
  const isOrganic = labelsTags.some((l: string) => l.includes('organic') || l.includes('bio'))

  return {
    barcode,
    name: row.product_name?.trim() || '',
    brand: (row.brands || '').split(',')[0]?.trim() || '',
    ingredients: row.ingredients_text?.trim() || '',
    additives_tags: (row.additives_tags || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    nova_group: parseNumber(row.nova_group),
    nutriscore_grade: row.nutriscore_grade?.trim() || null,
    nutrition: {
      energy_100g: parseNumber(row['energy_100g']),
      fat_100g: parseNumber(row['fat_100g']),
      saturated_fat_100g: parseNumber(row['saturated-fat_100g']),
      carbohydrates_100g: parseNumber(row['carbohydrates_100g']),
      sugars_100g: parseNumber(row['sugars_100g']),
      fiber_100g: parseNumber(row['fiber_100g']),
      proteins_100g: parseNumber(row['proteins_100g']),
      salt_100g: parseNumber(row['salt_100g']),
    },
    image_url: row.image_url?.trim() || null,
    categories_tags: (row.categories_tags || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    labels_tags: labelsTags.filter(Boolean),
    countries_tags: countriesTags,
    is_organic: isOrganic,
    import_source: 'openbeautyfacts',
    retailer_availability: [],
    avg_price: null,
    country: isUK ? 'UK' : 'Other',
  }
}

export async function importOpenBeautyFacts(options: ImportOptions): Promise<void> {
  logger.info('Starting Open Beauty Facts CSV import')

  const progress = new ProgressTracker('openbeautyfacts')
  const importLog = new ImportLogger('openbeautyfacts')
  await importLog.start()

  let resumeOffset = 0
  if (options.resume) {
    const checkpoint = await progress.load()
    if (checkpoint) {
      resumeOffset = checkpoint.offset
      logger.info({ offset: resumeOffset }, 'Resuming from checkpoint')
    }
  }

  let processed = 0
  let matched = 0
  let imported = 0
  let failed = 0
  let skipped = 0
  let batch: ProcessedProduct[] = []

  let httpStream: any = null
  let gunzipStream: zlib.Gunzip | null = null
  let rl: readline.Interface | null = null

  const tearDown = () => {
    try { rl?.close() } catch {}
    try { gunzipStream?.destroy() } catch {}
    try { httpStream?.destroy?.() } catch {}
  }

  try {
    logger.info('Downloading CSV from Open Beauty Facts...')
    const response = await axios.get(CSV_URL, {
      responseType: 'stream',
      headers: { 'User-Agent': 'IngredScan/1.0 (ingredscan.com)' },
    })

    httpStream = response.data
    gunzipStream = zlib.createGunzip()
    const stream = httpStream.pipe(gunzipStream)

    rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    })

    let header: string[] | null = null
    let stop = false

    for await (const line of rl) {
      if (stop) break
      if (!line) continue

      if (!header) {
        header = line.split('\t')
        continue
      }

      processed++
      if (processed <= resumeOffset) continue

      const cols = line.split('\t')
      const row: Record<string, string> = {}
      for (let i = 0; i < header.length; i++) row[header[i]] = cols[i] || ''

      const raw = csvRowToRawProduct(row)
      if (!raw) {
        skipped++
      } else {
        matched++
        batch.push(processProduct(raw))

        if (options.limit > 0 && matched >= options.limit) {
          stop = true
        }
      }

      if (batch.length >= 100 || (stop && batch.length > 0)) {
        const flushBatch = batch
        batch = []
        const res = await batchUpsert(flushBatch, { dryRun: options.dryRun }, logger)
        imported += res.success
        failed += res.failed
      }

      if (processed % 5000 === 0) {
        await progress.save(raw?.barcode || '', processed)
        await importLog.update(processed, imported, failed)
        logger.info({ processed, matched, imported, failed, skipped }, 'Progress')
      }
    }

    if (batch.length > 0) {
      const result = await batchUpsert(batch, { dryRun: options.dryRun }, logger)
      imported += result.success
      failed += result.failed
    }

    tearDown()
    await progress.complete()
    await importLog.finish('completed')
    logger.info({ processed, matched, imported, failed, skipped }, 'Import completed')
  } catch (error: any) {
    tearDown()
    logger.error({ error: error.message }, 'Import failed')
    await importLog.finish('failed')
    throw error
  }
}

// Live API mode — fetch single product
export async function fetchProductByBarcode(barcode: string): Promise<ProcessedProduct | null> {
  try {
    const response = await axios.get(`${API_BASE}/${barcode}.json`, {
      headers: { 'User-Agent': 'IngredScan/1.0 (ingredscan.com)' },
      timeout: 10000,
    })

    if (response.data.status !== 1 || !response.data.product) return null

    const p = response.data.product
    const labelsTags = p.labels_tags || []
    const countriesTags = p.countries_tags || []

    const raw: RawProduct = {
      barcode,
      name: p.product_name || '',
      brand: p.brands || '',
      ingredients: p.ingredients_text || '',
      additives_tags: p.additives_tags || [],
      nova_group: p.nova_group || null,
      nutriscore_grade: p.nutriscore_grade || null,
      nutrition: {
        energy_100g: p.nutriments?.['energy-kcal_100g'] ?? null,
        fat_100g: p.nutriments?.['fat_100g'] ?? null,
        saturated_fat_100g: p.nutriments?.['saturated-fat_100g'] ?? null,
        carbohydrates_100g: p.nutriments?.['carbohydrates_100g'] ?? null,
        sugars_100g: p.nutriments?.['sugars_100g'] ?? null,
        fiber_100g: p.nutriments?.['fiber_100g'] ?? null,
        proteins_100g: p.nutriments?.['proteins_100g'] ?? null,
        salt_100g: p.nutriments?.['salt_100g'] ?? null,
      },
      image_url: p.image_front_url || null,
      categories_tags: p.categories_tags || [],
      labels_tags: labelsTags,
      countries_tags: countriesTags,
      is_organic: labelsTags.some((l: string) => l.includes('organic') || l.includes('bio')),
      import_source: 'openbeautyfacts',
      retailer_availability: [],
      avg_price: null,
      country: countriesTags.some((c: string) => c.includes('united-kingdom')) ? 'UK' : 'Other',
    }

    return processProduct(raw)
  } catch {
    return null
  }
}
