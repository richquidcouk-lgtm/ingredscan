import { supabaseAdmin } from './utils/supabaseAdmin'

async function main() {
  // Grab 3 recently-updated rows and check v3 columns
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('barcode, name, quality_score, quality_score_v3, nutrition_score_v3, additive_score_v3, organic_bonus_v3, quality_score_version')
    .eq('import_source', 'openfoodfacts')
    .not('quality_score_v3', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error:', error.message)
    return
  }
  if (!data || data.length === 0) {
    console.log('No rows with quality_score_v3 yet — import may still be on early rows.')
    return
  }
  for (const r of data) {
    console.log(JSON.stringify(r, null, 2))
    console.log('---')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
