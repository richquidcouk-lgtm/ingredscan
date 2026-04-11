import { supabaseAdmin } from './utils/supabaseAdmin'

const BARCODE = process.argv[2] || '5000354914287'

async function main() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      'barcode, name, product_type, import_source, quality_score, quality_score_v3, quality_score_version, nutrition_score_v3, additive_score_v3, organic_bonus_v3, quality_score_breakdown',
    )
    .eq('barcode', BARCODE)
    .single()

  if (error || !data) {
    console.error('not found:', error?.message)
    process.exit(1)
  }

  console.log('name:', data.name)
  console.log('product_type:', data.product_type, '  import_source:', data.import_source)
  console.log('quality_score (v2):', data.quality_score)
  console.log('quality_score_v3:', data.quality_score_v3, '  version:', data.quality_score_version)
  console.log('pillars: nutrition=', data.nutrition_score_v3, ' additive=', data.additive_score_v3, ' organic=', data.organic_bonus_v3)
  console.log('breakdown:', JSON.stringify(data.quality_score_breakdown, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
