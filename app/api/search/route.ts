import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// Searches the local Supabase products table (~1M food products from Open
// Food Facts + ~40k cosmetics from Open Beauty Facts). Accepts:
//   - q: free-text name/brand match (min 2 chars)
//   - type: 'food' | 'cosmetic'  (default: food)
//   - category: categories_tags contains filter, e.g. 'en:breads'
// Either q or category must be provided; both together intersect.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || ''
  const type = request.nextUrl.searchParams.get('type') || 'food'
  const category = request.nextUrl.searchParams.get('category')?.trim() || ''
  const limitParam = parseInt(request.nextUrl.searchParams.get('limit') || '30', 10)
  const limit = Math.max(1, Math.min(100, isNaN(limitParam) ? 30 : limitParam))

  // Must provide at least one of q or category.
  if (q.length < 2 && !category) {
    return NextResponse.json({ products: [], count: 0 })
  }

  const supabase = getServiceSupabase()

  let query = supabase
    .from('products')
    .select('barcode, name, brand, image_url, nutriscore_grade, nova_score, quality_score')
    // Highest quality first. nullsFirst: false keeps unscored products at the bottom.
    .order('quality_score', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (type === 'cosmetic') {
    query = query.eq('import_source', 'openbeautyfacts')
  } else {
    query = query.eq('import_source', 'openfoodfacts')
  }

  if (q.length >= 2) {
    // Escape commas/parens which would break the PostgREST `or` filter.
    const safe = q.replace(/[%,()]/g, ' ').trim()
    const pattern = `%${safe}%`
    query = query.or(`name.ilike.${pattern},brand.ilike.${pattern}`)
  }

  if (category) {
    // categories_tags is a text[] column — postgrest `cs` = contains.
    query = query.contains('categories_tags', [category])
  }

  const { data, error } = await query

  if (error) {
    console.error('[api/search] supabase error:', error.message)
    return NextResponse.json({ products: [], count: 0 }, { status: 500 })
  }

  // Return shape compatible with the existing OFFSearchResult type.
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
