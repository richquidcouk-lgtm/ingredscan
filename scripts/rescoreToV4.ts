import { appendFileSync } from 'fs'
import { supabaseAdmin } from './utils/supabaseAdmin'
import { scoreProduct } from '../lib/scoring'
import { calculateCosmeticScore } from '../lib/cosmeticScoring'
import {
  parseInciIngredients,
  matchCosmeticIngredients,
} from '../lib/openBeautyFacts'

// Rescores existing rows with the v4 scoring formula. Writes into the v3
// columns (quality_score_v3, nutrition_score_v3, additive_score_v3,
// organic_bonus_v3) + quality_score_breakdown, and bumps quality_score_version
// to 4. The original v2 quality_score column is NEVER touched.
//
// Food rows use lib/scoring (Yuka-aligned worst-tier additive formula).
// Cosmetic rows use lib/cosmeticScoring against INCI ingredients parsed from
// the stored ingredients text.
//
// NOVA-inferred artifact: we pass off_nova_group to lib/scoring rather than
// nova_score, so inferred rows produce stable results across reruns.
//
// Usage:
//   npx tsx scripts/rescoreToV4.ts [--dry-run] [--verbose] [--barcode=123]
//   npx tsx scripts/rescoreToV4.ts --type=food         (food-only pass)
//   npx tsx scripts/rescoreToV4.ts --type=cosmetic     (cosmetic-only pass)

const PAGE_SIZE = 1000
const UPSERT_CHUNK = 200
const MAX_RETRIES = 4
const FAILED_LOG = 'rescoreToV4.failed.log'
const DRY_RUN = process.argv.includes('--dry-run')
const VERBOSE = process.argv.includes('--verbose')
const SINGLE = process.argv.find((a) => a.startsWith('--barcode='))?.split('=')[1]
const TYPE_FILTER = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1] as
  | 'food'
  | 'cosmetic'
  | undefined

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function upsertWithRetry(chunk: UpdatePayload[]): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .upsert(chunk, { onConflict: 'barcode' })
      if (!error) return true
      console.error(`  upsert error (attempt ${attempt}/${MAX_RETRIES}):`, error.message)
    } catch (e) {
      console.error(`  upsert threw (attempt ${attempt}/${MAX_RETRIES}):`, (e as Error).message)
    }
    if (attempt < MAX_RETRIES) await sleep(1000 * 2 ** (attempt - 1))
  }
  const first = chunk[0]?.barcode
  const last = chunk[chunk.length - 1]?.barcode
  appendFileSync(FAILED_LOG, `${new Date().toISOString()}  ${first}..${last}  ${chunk.length} rows\n`)
  console.error(`  ✗ chunk permanently failed, logged to ${FAILED_LOG}: ${first}..${last}`)
  return false
}

type Row = {
  barcode: string
  name: string
  product_type: string | null
  import_source: string | null
  nova_score: number | null
  off_nova_group: number | null
  nova_source: string | null
  quality_score: number | null
  quality_score_v3: number | null
  quality_score_version: number | null
  nutriscore_grade: string | null
  ingredients: string | null
  additives: Array<{ code: string }> | null
  categories_tags: string[] | null
  labels_tags: string[] | null
  nutrition: {
    energy?: number | null
    fat?: number | null
    saturated_fat?: number | null
    carbs?: number | null
    sugars?: number | null
    fibre?: number | null
    protein?: number | null
    salt?: number | null
  } | null
}

type UpdatePayload = {
  barcode: string
  product_type: 'food' | 'cosmetic'
  quality_score_v3: number
  nutrition_score_v3: number | null
  additive_score_v3: number | null
  organic_bonus_v3: number | null
  quality_score_breakdown: Record<string, unknown>
  quality_score_version: number
  quality_score_updated_at: string
  updated_at: string
}

const COSMETIC_CATEGORY_HINTS = new Set([
  'en:cosmetics', 'en:beauty', 'en:skin-care', 'en:hair-care',
  'en:makeup', 'en:perfumes', 'en:shampoos', 'en:shower-gels',
  'en:face-creams', 'en:body-lotions', 'en:sunscreens',
  'en:deodorants', 'en:toothpastes', 'en:lip-care', 'en:nail-polish',
])

function isCosmeticRow(row: Row): boolean {
  if (row.product_type === 'cosmetic') return true
  if (row.import_source === 'openbeautyfacts') return true
  const cats = (row.categories_tags || []).map((c) => c.toLowerCase())
  return cats.some((c) => COSMETIC_CATEGORY_HINTS.has(c))
}

function rescoreFood(row: Row) {
  const n = row.nutrition || {}
  const nutriments: Record<string, number> = {}
  if (n.energy != null) nutriments['energy_100g'] = n.energy
  if (n.fat != null) nutriments['fat_100g'] = n.fat
  if (n.saturated_fat != null) nutriments['saturated-fat_100g'] = n.saturated_fat
  if (n.carbs != null) nutriments['carbohydrates_100g'] = n.carbs
  if (n.sugars != null) nutriments['sugars_100g'] = n.sugars
  if (n.fibre != null) nutriments['fiber_100g'] = n.fibre
  if (n.protein != null) nutriments['proteins_100g'] = n.protein
  if (n.salt != null) nutriments['salt_100g'] = n.salt

  const additives_tags = (row.additives || []).map(
    (a) => `en:${a.code.toLowerCase()}`,
  )

  let originalNova: number | undefined
  if (row.off_nova_group && row.off_nova_group >= 1 && row.off_nova_group <= 4) {
    originalNova = row.off_nova_group
  } else if (row.nova_source === 'off_direct' && row.nova_score) {
    originalNova = row.nova_score
  }

  const result = scoreProduct({
    nova_group: originalNova,
    nutriscore_grade: row.nutriscore_grade ?? undefined,
    additives_tags,
    categories_tags: row.categories_tags || [],
    labels_tags: row.labels_tags || [],
    nutriments,
    ingredients_text: row.ingredients || '',
  })

  const bd = result.quality_breakdown
  return {
    quality_score_v3: result.quality_score,
    nutrition_score_v3: bd.nutritionScore,
    additive_score_v3: bd.additiveScore,
    organic_bonus_v3: bd.organicBonus,
    quality_score_breakdown: bd as unknown as Record<string, unknown>,
    quality_score_version: bd.version,
  }
}

function rescoreCosmetic(row: Row) {
  const labels = (row.labels_tags || []).map((l) => l.toLowerCase())
  const ingText = (row.ingredients || '').toUpperCase()

  const flags = {
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

  const matched = matchCosmeticIngredients(
    parseInciIngredients(row.ingredients || ''),
  )
  const cosmeticScore = calculateCosmeticScore(flags, matched)

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

  return {
    quality_score_v3: Math.round(cosmeticScore.overallScore * 10),
    nutrition_score_v3: null,
    additive_score_v3: null,
    organic_bonus_v3: null,
    quality_score_breakdown: breakdown,
    quality_score_version: 5,
  }
}

function rescoreRow(row: Row) {
  return isCosmeticRow(row) ? rescoreCosmetic(row) : rescoreFood(row)
}

const SELECT_COLS =
  'barcode, name, product_type, import_source, nova_score, off_nova_group, nova_source, quality_score, quality_score_v3, quality_score_version, nutriscore_grade, ingredients, additives, categories_tags, labels_tags, nutrition'

async function rescoreOne(barcode: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(SELECT_COLS)
    .eq('barcode', barcode)
    .single()
  if (error || !data) {
    console.error('not found:', error?.message)
    return
  }
  const row = data as Row
  const after = rescoreRow(row)
  const kind = isCosmeticRow(row) ? 'cosmetic' : 'food'
  console.log(`${row.barcode}  ${row.name}  [${kind}]`)
  console.log(`  before: v${row.quality_score_version ?? '?'} quality_v3=${row.quality_score_v3}`)
  console.log(`  after:  v${after.quality_score_version} quality_v3=${after.quality_score_v3}`)
  if (!DRY_RUN) {
    const now = new Date().toISOString()
    await supabaseAdmin
      .from('products')
      .update({
        quality_score_v3: after.quality_score_v3,
        nutrition_score_v3: after.nutrition_score_v3,
        additive_score_v3: after.additive_score_v3,
        organic_bonus_v3: after.organic_bonus_v3,
        quality_score_breakdown: after.quality_score_breakdown,
        quality_score_version: after.quality_score_version,
        quality_score_updated_at: now,
        updated_at: now,
      })
      .eq('barcode', barcode)
    console.log('  ✓ updated')
  }
}

async function rescoreAll() {
  let cursor: string | null = null
  let totalChanged = 0
  let totalSeen = 0

  while (true) {
    // Keyset pagination on barcode — avoids statement timeouts on deep
    // offsets across the 1M+ row products table.
    let query = supabaseAdmin
      .from('products')
      .select(SELECT_COLS)
      .order('barcode', { ascending: true })
      .limit(PAGE_SIZE)

    if (cursor) query = query.gt('barcode', cursor)

    // Filter by import_source rather than product_type — it's indexed and
    // covers 100% of cosmetic rows (all OBF) without hitting a compound
    // .or() clause that Supabase won't plan efficiently.
    if (TYPE_FILTER === 'cosmetic') {
      query = query.eq('import_source', 'openbeautyfacts')
    } else if (TYPE_FILTER === 'food') {
      query = query.neq('import_source', 'openbeautyfacts')
    }

    const { data, error } = await query

    if (error) {
      console.error('fetch error:', error.message)
      break
    }
    if (!data || data.length === 0) break

    const updates: UpdatePayload[] = []
    const now = new Date().toISOString()

    for (const row of data as Row[]) {
      totalSeen++
      const after = rescoreRow(row)
      const prev = row.quality_score_v3 ?? -1
      const prevVersion = row.quality_score_version ?? 0
      const expectedType = isCosmeticRow(row) ? 'cosmetic' : 'food'
      const typeMismatch = row.product_type !== expectedType
      const changed =
        prevVersion < after.quality_score_version ||
        Math.abs(prev - after.quality_score_v3) > 0.5 ||
        typeMismatch

      if (changed) {
        totalChanged++
        if (VERBOSE) {
          console.log(
            `  ${row.barcode}  ${row.name}: v${prevVersion}→v${after.quality_score_version}  ${prev}→${after.quality_score_v3}`,
          )
        }
        updates.push({
          barcode: row.barcode,
          product_type: isCosmeticRow(row) ? 'cosmetic' : 'food',
          quality_score_v3: after.quality_score_v3,
          nutrition_score_v3: after.nutrition_score_v3,
          additive_score_v3: after.additive_score_v3,
          organic_bonus_v3: after.organic_bonus_v3,
          quality_score_breakdown: after.quality_score_breakdown,
          quality_score_version: after.quality_score_version,
          quality_score_updated_at: now,
          updated_at: now,
        })
      }
    }

    if (!DRY_RUN && updates.length > 0) {
      for (let i = 0; i < updates.length; i += UPSERT_CHUNK) {
        const chunk = updates.slice(i, i + UPSERT_CHUNK)
        await upsertWithRetry(chunk)
      }
    }

    cursor = (data[data.length - 1] as Row).barcode
    console.log(`progress: seen=${totalSeen} changed=${totalChanged} cursor=${cursor}`)

    if (data.length < PAGE_SIZE) break
  }

  console.log(
    `\nDone. seen=${totalSeen} changed=${totalChanged} dryRun=${DRY_RUN} typeFilter=${TYPE_FILTER ?? 'all'}`,
  )
}

async function main() {
  if (SINGLE) {
    await rescoreOne(SINGLE)
  } else {
    await rescoreAll()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
