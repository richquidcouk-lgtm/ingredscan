import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// Searches the local Supabase products table. Accepts:
//   - q: free-text name/brand match (min 2 chars)
//   - type: 'food' | 'cosmetic'  (default: food)
//   - category: a keyword that gets ILIKE'd against name AND the joined
//     `category` text column. We deliberately do NOT filter on the
//     structured `categories_tags` array because it is sparsely populated
//     in the OFF dump (many products have only free-text categories).
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

  // Escape commas/parens/percent which would break the PostgREST `or` filter.
  const escape = (s: string) => s.replace(/[%,()]/g, ' ').trim()

  // The search page sends EITHER q (free-text) OR category (a keyword from
  // the curated category list). Treat them identically: ILIKE the term
  // against name + brand + category. Single .or() call avoids the chaining
  // pitfall where two separate .or() filters were producing empty results.
  const term = (q.length >= 2 ? q : category).trim()
  if (!term) {
    return NextResponse.json({ products: [], count: 0 })
  }
  const pattern = `%${escape(term)}%`

  // Default to UK products. Caller can override with ?country= param.
  const country = request.nextUrl.searchParams.get('country')?.trim() || 'UK'

  let query = supabase
    .from('products')
    .select('barcode, name, brand, image_url, nutriscore_grade, nova_score, quality_score, quality_score_v3')
    .neq('data_source', 'not_found')
    .eq('country', country)
    .or(`name.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern}`)
    .order('quality_score', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (type === 'cosmetic') {
    query = query.eq('import_source', 'openbeautyfacts')
  } else {
    query = query.eq('import_source', 'openfoodfacts')
  }

  const { data, error } = await query

  if (error) {
    console.error('[api/search] supabase error:', error.message)
    return NextResponse.json({ products: [], count: 0, error: error.message }, { status: 500 })
  }

  // Return shape compatible with the existing OFFSearchResult type.
  const products = (data || []).map((p) => ({
    code: p.barcode,
    product_name: p.name,
    brands: p.brand,
    nova_group: p.nova_score,
    nutriscore_grade: p.nutriscore_grade,
    quality_score: p.quality_score,
    quality_score_v3: p.quality_score_v3,
    image_front_small_url: p.image_url,
  }))

  return NextResponse.json({ products, count: products.length })
}
