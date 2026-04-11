import { supabaseAdmin } from './utils/supabaseAdmin'

// Sanity-check a just-written row to confirm the new traceability columns
// are being populated.
async function main() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      'barcode, name, off_nova_group, nova_source, nova_score, nutriscore_grade, quality_score, quality_score_version, quality_score_breakdown, quality_score_updated_at'
    )
    .eq('import_source', 'openfoodfacts')
    .order('quality_score_updated_at', { ascending: false, nullsFirst: false })
    .limit(3)

  if (error) {
    console.error(error)
    return
  }
  for (const r of data || []) {
    console.log(JSON.stringify(r, null, 2))
    console.log('---')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
