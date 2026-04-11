import { supabaseAdmin } from './utils/supabaseAdmin'

async function main() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('barcode, name, quality_score, quality_score_v3, nutrition_score_v3, additive_score_v3, organic_bonus_v3')
    .not('quality_score_v3', 'is', null)
    .limit(3)
  if (error) { console.error(error.message); return }
  if (!data?.length) { console.log('No v3 rows yet'); return }
  for (const r of data) console.log(JSON.stringify(r))
}
main()
