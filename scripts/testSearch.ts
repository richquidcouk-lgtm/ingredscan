import { supabaseAdmin } from './utils/supabaseAdmin'

// Test the exact same query the /api/search route uses, against the live DB.
// Tells us in seconds whether the bug is in the SQL or somewhere upstream.

async function testQuery(term: string, type: 'food' | 'cosmetic') {
  const pattern = `%${term}%`
  const source = type === 'cosmetic' ? 'openbeautyfacts' : 'openfoodfacts'

  console.log(`\n--- "${term}" against ${source} ---`)
  const start = Date.now()
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('barcode, name, brand, quality_score')
    .eq('import_source', source)
    .or(`name.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`)
    .order('quality_score', { ascending: false, nullsFirst: false })
    .limit(10)
  const ms = Date.now() - start

  if (error) {
    console.log(`  ERROR (${ms}ms):`, error.message)
    return
  }
  console.log(`  ${data?.length ?? 0} results in ${ms}ms`)
  for (const row of (data || []).slice(0, 3)) {
    console.log(`  - ${row.name?.slice(0, 50)}  qty=${row.quality_score}`)
  }
}

async function main() {
  await testQuery('milk', 'food')
  await testQuery('bread', 'food')
  await testQuery('chocolate', 'food')
  await testQuery('shampoo', 'cosmetic')
  await testQuery('moisturiz', 'cosmetic')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
