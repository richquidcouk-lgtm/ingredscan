import { supabaseAdmin } from './utils/supabaseAdmin'
import { scoreProduct } from '../lib/scoring'

// One-off sanity check: report row counts for bulk-imported sources and
// look for the v1-scoring fingerprint (NOVA-4 ultra-processed rows that
// still carry quality_score >= 8.0, which the v2 scorer cannot produce).

async function count(filter: (q: any) => any, label: string) {
  const { count, error } = await filter(
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true })
  )
  if (error) {
    console.log(`  ${label}: ERROR ${error.message}`)
    return 0
  }
  console.log(`  ${label}: ${count?.toLocaleString() ?? 0}`)
  return count ?? 0
}

async function main() {
  console.log('\n=== Bulk import status ===')
  await count((q) => q.eq('import_source', 'openfoodfacts'), 'openfoodfacts total')
  await count((q) => q.eq('import_source', 'openfoodfacts').eq('country', 'UK'), '  UK')
  await count((q) => q.eq('import_source', 'openfoodfacts').eq('country', 'US'), '  US')
  await count((q) => q.eq('import_source', 'openbeautyfacts'), 'openbeautyfacts total')

  console.log('\n=== v1-score fingerprint breakdown by country ===')
  await count(
    (q) => q.eq('import_source', 'openfoodfacts').eq('country', 'UK').eq('nova_score', 4).gte('quality_score', 9.0),
    'UK  NOVA-4 with quality >= 9.0'
  )
  await count(
    (q) => q.eq('import_source', 'openfoodfacts').eq('country', 'US').eq('nova_score', 4).gte('quality_score', 9.0),
    'US  NOVA-4 with quality >= 9.0'
  )

  console.log('\n=== Spot-check: recompute 5 "broken" rows through lib/scoring ===')
  const { data } = await supabaseAdmin
    .from('products')
    .select('barcode, name, country, nova_score, quality_score, nutriscore_grade, ingredients, additives, categories_tags, labels_tags, nutrition')
    .eq('import_source', 'openfoodfacts')
    .eq('nova_score', 4)
    .gte('quality_score', 9.0)
    .limit(5)

  for (const r of (data || []) as any[]) {
    const n = r.nutrition || {}
    const nutriments: Record<string, number> = {}
    if (n.energy != null) nutriments['energy_100g'] = n.energy
    if (n.fat != null) nutriments['fat_100g'] = n.fat
    if (n.saturated_fat != null) nutriments['saturated-fat_100g'] = n.saturated_fat
    if (n.carbs != null) nutriments['carbohydrates_100g'] = n.carbs
    if (n.sugars != null) nutriments['sugars_100g'] = n.sugars
    if (n.fibre != null) nutriments['fiber_100g'] = n.fibre
    if (n.protein != null) nutriments['proteins_100g'] = n.protein
    if (n.salt != null) nutriments['salt_100g'] = n.salt

    const additives_tags = (r.additives || []).map((a: any) => `en:${a.code.toLowerCase()}`)

    const result = scoreProduct({
      nova_group: r.nova_score,
      nutriscore_grade: r.nutriscore_grade ?? undefined,
      additives_tags,
      categories_tags: r.categories_tags || [],
      labels_tags: r.labels_tags || [],
      nutriments,
      ingredients_text: r.ingredients || '',
    })

    console.log(
      `  ${r.barcode}  ${r.country}  stored: nova=${r.nova_score} qty=${r.quality_score}  recomputed: nova=${result.nova_score} qty=${result.quality_score}  — ${r.name?.slice(0, 40)}`
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
