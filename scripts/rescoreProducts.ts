import { supabaseAdmin } from './utils/supabaseAdmin'
import { scoreProduct } from '../lib/scoring'

// Rescores all products imported by the bulk OFF importer using the canonical
// lib/scoring logic. Needed because earlier imports used a broken local
// scorer that ignored nova_group and matched additive tags incorrectly,
// resulting in NOVA-4 ultra-processed products getting 10/10 quality scores.

const PAGE_SIZE = 1000
const DRY_RUN = process.argv.includes('--dry-run')
const VERBOSE = process.argv.includes('--verbose')
const SINGLE = process.argv.find((a) => a.startsWith('--barcode='))?.split('=')[1]

type Row = {
  barcode: string
  name: string
  nova_score: number | null
  quality_score: number | null
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

function rescore(row: Row): { nova: number; quality: number } {
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

  // Reconstruct OFF-style additives_tags from stored E-codes
  const additives_tags = (row.additives || []).map(
    (a) => `en:${a.code.toLowerCase()}`
  )

  const result = scoreProduct({
    nova_group: row.nova_score && row.nova_score >= 1 && row.nova_score <= 4 ? row.nova_score : undefined,
    nutriscore_grade: row.nutriscore_grade ?? undefined,
    additives_tags,
    categories_tags: row.categories_tags || [],
    labels_tags: row.labels_tags || [],
    nutriments,
    ingredients_text: row.ingredients || '',
  })

  return { nova: result.nova_score, quality: result.quality_score }
}

async function rescoreOne(barcode: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('barcode, name, nova_score, quality_score, nutriscore_grade, ingredients, additives, categories_tags, labels_tags, nutrition')
    .eq('barcode', barcode)
    .single()
  if (error || !data) {
    console.error('not found:', error?.message)
    return
  }
  const row = data as Row
  const before = { nova: row.nova_score, quality: row.quality_score }
  const after = rescore(row)
  console.log(`${row.barcode}  ${row.name}`)
  console.log(`  before: nova=${before.nova} quality=${before.quality}`)
  console.log(`  after:  nova=${after.nova} quality=${after.quality}`)
  if (!DRY_RUN) {
    await supabaseAdmin
      .from('products')
      .update({ nova_score: after.nova, quality_score: after.quality, updated_at: new Date().toISOString() })
      .eq('barcode', barcode)
    console.log('  ✓ updated')
  }
}

async function rescoreAll() {
  let offset = 0
  let totalRescored = 0
  let totalChanged = 0
  let totalSeen = 0

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('barcode, name, nova_score, quality_score, nutriscore_grade, ingredients, additives, categories_tags, labels_tags, nutrition')
      .eq('import_source', 'openfoodfacts')
      .order('barcode', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('fetch error:', error.message)
      break
    }
    if (!data || data.length === 0) break

    const updates: Array<{ barcode: string; nova_score: number; quality_score: number; updated_at: string }> = []
    const now = new Date().toISOString()

    for (const row of data as Row[]) {
      totalSeen++
      const after = rescore(row)
      const changed = after.nova !== row.nova_score || Math.abs((row.quality_score || 0) - after.quality) > 0.05
      if (changed) {
        totalChanged++
        if (VERBOSE) {
          console.log(`  ${row.barcode}  ${row.name}: ${row.quality_score} → ${after.quality}`)
        }
        updates.push({
          barcode: row.barcode,
          nova_score: after.nova,
          quality_score: after.quality,
          updated_at: now,
        })
      }
    }

    if (!DRY_RUN && updates.length > 0) {
      // Upsert in chunks of 200 to keep payloads small
      for (let i = 0; i < updates.length; i += 200) {
        const chunk = updates.slice(i, i + 200)
        const { error: upErr } = await supabaseAdmin
          .from('products')
          .upsert(chunk, { onConflict: 'barcode' })
        if (upErr) {
          console.error(`upsert error at chunk ${i}:`, upErr.message)
        } else {
          totalRescored += chunk.length
        }
      }
    }

    offset += PAGE_SIZE
    console.log(`progress: seen=${totalSeen} changed=${totalChanged} rescored=${totalRescored}`)

    if (data.length < PAGE_SIZE) break
  }

  console.log(`\nDone. seen=${totalSeen} changed=${totalChanged} rescored=${totalRescored} dryRun=${DRY_RUN}`)
}

async function main() {
  if (SINGLE) {
    await rescoreOne(SINGLE)
  } else {
    await rescoreAll()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
