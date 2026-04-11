import { supabaseAdmin } from './utils/supabaseAdmin'

// Inspect the actual categories_tags column type and contents.

async function main() {
  // Pull a few openfoodfacts rows directly and see what we get back.
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('barcode, name, categories_tags')
    .eq('import_source', 'openfoodfacts')
    .not('categories_tags', 'is', null)
    .limit(5)
  if (error) {
    console.error('select error:', error.message)
    return
  }
  console.log('=== Raw rows ===')
  for (const r of data || []) {
    console.log(`barcode: ${r.barcode}`)
    console.log(`name: ${r.name}`)
    console.log(`typeof categories_tags: ${typeof r.categories_tags}`)
    console.log(`isArray: ${Array.isArray(r.categories_tags)}`)
    console.log(`JSON: ${JSON.stringify(r.categories_tags)?.slice(0, 250)}`)
    console.log('---')
  }

  // Try different filter syntaxes against an arbitrary tag.
  console.log('\n=== Filter syntax tests for en:breads ===')

  const { count: c1, error: e1 } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('import_source', 'openfoodfacts')
    .contains('categories_tags', ['en:breads'])
  console.log(`.contains(['en:breads'])  count=${c1}  error=${e1?.message || 'none'}`)

  const { count: c2, error: e2 } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('import_source', 'openfoodfacts')
    .contains('categories_tags', '["en:breads"]')
  console.log(`.contains('["en:breads"]')  count=${c2}  error=${e2?.message || 'none'}`)

  const { count: c3, error: e3 } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('import_source', 'openfoodfacts')
    .filter('categories_tags', 'cs', '{en:breads}')
  console.log(`.filter('cs', '{en:breads}')  count=${c3}  error=${e3?.message || 'none'}`)

  // Try a category we KNOW will exist somewhere
  const { data: bread, error: e4 } = await supabaseAdmin
    .from('products')
    .select('barcode, name, categories_tags')
    .eq('import_source', 'openfoodfacts')
    .ilike('name', '%bread%')
    .limit(3)
  console.log(`\nName ILIKE %bread% sample (error=${e4?.message || 'none'}):`)
  for (const r of bread || []) {
    const tags = (r.categories_tags as any) || []
    console.log(`  ${r.name}`)
    console.log(`  tags: ${JSON.stringify(tags).slice(0, 200)}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
