import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// Searches the local Supabase products table (~165k UK food products from
// Open Food Facts + ~64k cosmetics from Open Beauty Facts). Far faster and
// more reliable than calling OFF/OBF search APIs which are frequently down.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || ''
  const type = request.nextUrl.searchParams.get('type') || 'food'

  if (q.length < 2) {
    return NextResponse.json({ products: [], count: 0 })
  }

  const supabase = getServiceSupabase()

  // Match by name OR brand. PostgREST `or` filter syntax.
  // Escape commas/parens which would break the filter expression.
  const safe = q.replace(/[%,()]/g, ' ').trim()
  const pattern = `%${safe}%`

  let query = supabase
    .from('products')
    .select('barcode, name, brand, image_url, nutriscore_grade, nova_score, quality_score, product_type')
    .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
    // Highest quality first so the best matches surface at the top.
    // nullsFirst: false keeps unscored products at the bottom.
    .order('quality_score', { ascending: false, nullsFirst: false })
    .limit(20)

  if (type === 'cosmetic') {
    query = query.eq('import_source', 'openbeautyfacts')
  } else {
    query = query.eq('import_source', 'openfoodfacts')
  }

  const { data, error } = await query

  if (error) {
    console.error('[api/search] supabase error:', error.message)
    return NextResponse.json({ products: [], count: 0 }, { status: 500 })
  }

  // Return shape compatible with the existing OFFSearchResult type the
  // scan page expects: products[].code/product_name/brands/image_front_small_url
  const products = (data || []).map((p) => ({
    code: p.barcode,
    product_name: p.name,
    brands: p.brand,
    nova_group: p.nova_score,
    nutriscore_grade: p.nutriscore_grade,
    quality_score: p.quality_score,
    image_front_small_url: p.image_url,
  }))

  return NextResponse.json({ products, count: products.length })
}
