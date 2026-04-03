import { NextRequest, NextResponse } from 'next/server'
import { fetchProduct, isUKProduct, validateProduct } from '@/lib/openFoodFacts'
import { resolveAdditives } from '@/lib/scoring'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('barcode')

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // Check cache
  const { data: cached } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (cached) {
    // Check if cache is fresh (30 days)
    const updatedAt = new Date(cached.updated_at)
    const daysSince = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 30) {
      return NextResponse.json(cached)
    }
  }

  // Fetch from Open Food Facts
  const offProduct = await fetchProduct(barcode)

  if (!offProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Validate and score with overrides
  const validated = validateProduct(offProduct)
  const additives = resolveAdditives(offProduct.additives_tags || [])
  const isUK = isUKProduct(offProduct)

  const product = {
    barcode,
    name: offProduct.product_name || 'Unknown Product',
    brand: offProduct.brands || 'Unknown Brand',
    nova_score: validated.nova_score,
    quality_score: validated.quality_score,
    nutriscore_grade: offProduct.nutriscore_grade || '',
    ingredients: offProduct.ingredients_text || '',
    additives,
    nutrition: {
      energy: offProduct.nutriments?.['energy-kcal_100g'] ?? null,
      fat: offProduct.nutriments?.['fat_100g'] ?? null,
      saturated_fat: offProduct.nutriments?.['saturated-fat_100g'] ?? null,
      carbs: offProduct.nutriments?.['carbohydrates_100g'] ?? null,
      sugars: offProduct.nutriments?.['sugars_100g'] ?? null,
      fibre: offProduct.nutriments?.['fiber_100g'] ?? null,
      protein: offProduct.nutriments?.['proteins_100g'] ?? null,
      salt: offProduct.nutriments?.['salt_100g'] ?? null,
    },
    image_url: offProduct.image_front_url || '',
    data_source: isUK ? 'Open Food Facts + UK FSA' : 'Open Food Facts + USDA',
    confidence: validated.confidence,
    category: (offProduct.categories_tags || []).join(', '),
    warning: validated.warning,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Save to cache
  await supabase
    .from('products')
    .upsert(product, { onConflict: 'barcode' })

  return NextResponse.json(product)
}
