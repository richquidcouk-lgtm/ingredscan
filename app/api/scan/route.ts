import { NextRequest, NextResponse } from 'next/server'
import { fetchProduct, isUKProduct, validateProduct, getBrand } from '@/lib/openFoodFacts'
import { fetchFromOpenBeautyFacts, parseInciIngredients, matchCosmeticIngredients, detectCosmeticFlags } from '@/lib/openBeautyFacts'
import { detectProductCategory } from '@/lib/categoryDetection'
import { resolveAdditives } from '@/lib/scoring'
import { calculateCosmeticScore } from '@/lib/cosmeticScoring'
import { detectSpecialCategory } from '@/lib/specialCategories'
import { validateProductData } from '@/lib/dataQuality'
import { extractRetailerInfo } from '@/lib/retailers'
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
      // For cached cosmetic products, compute the score on the fly
      if (cached.product_type === 'cosmetic' && cached.inci_ingredients) {
        const score = calculateCosmeticScore(cached, cached.inci_ingredients)
        return NextResponse.json({ ...cached, cosmetic_score: score })
      }
      return NextResponse.json(cached)
    }
  }

  // Fetch from both APIs simultaneously
  const [offProduct, obfProduct] = await Promise.all([
    fetchProduct(barcode),
    fetchFromOpenBeautyFacts(barcode),
  ])

  // Detect category
  const productType = detectProductCategory(
    offProduct ? { product: offProduct } : null,
    obfProduct ? { product: obfProduct } : null
  )

  if (productType === 'cosmetic') {
    return handleCosmeticProduct(barcode, obfProduct, offProduct, supabase)
  }

  // --- FOOD FLOW (existing) ---
  if (!offProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const validated = validateProduct(offProduct)
  const additives = resolveAdditives(offProduct.additives_tags || [])
  const isUK = isUKProduct(offProduct)

  // Detect special categories and nova source
  const novaSource = offProduct.nova_group ? 'off_direct' : 'inferred'
  const specialCategory = detectSpecialCategory(offProduct)

  const product = {
    barcode,
    name: offProduct.product_name_en || offProduct.product_name || 'Unknown Product',
    brand: getBrand(offProduct),
    nova_score: validated.nova_score,
    quality_score: validated.quality_score,
    nutriscore_grade: offProduct.nutriscore_grade || '',
    ingredients: offProduct.ingredients_text_en || offProduct.ingredients_text_with_allergens_en || offProduct.ingredients_text || '',
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
    product_type: 'food' as const,
    nova_source: novaSource,
    special_category: specialCategory,
    quality_score_breakdown: validated.quality_breakdown,
    quality_score_version: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Data quality validation
  const dataQuality = validateProductData({
    ingredients_text: offProduct.ingredients_text || offProduct.ingredients_text_en,
    nutriments: offProduct.nutriments,
    product_name: offProduct.product_name,
  })

  // Save to cache — use only base columns that definitely exist
  // Additional columns from migrations are optional
  const cacheProduct: Record<string, any> = {
    barcode: product.barcode,
    name: product.name,
    brand: product.brand,
    nova_score: product.nova_score,
    quality_score: product.quality_score,
    nutriscore_grade: product.nutriscore_grade,
    ingredients: product.ingredients,
    additives: product.additives,
    nutrition: product.nutrition,
    image_url: product.image_url,
    data_source: product.data_source,
    confidence: product.confidence,
    category: product.category,
    created_at: product.created_at,
    updated_at: product.updated_at,
  }

  // Try with all columns first, fall back to base columns
  const { error: upsertError } = await supabase
    .from('products')
    .upsert({
      ...cacheProduct,
      product_type: product.product_type,
      nova_source: novaSource,
      special_category: specialCategory,
      quality_score_breakdown: validated.quality_breakdown,
      quality_score_version: 2,
    }, { onConflict: 'barcode' })

  if (upsertError) {
    console.error('[IngredScan] Full upsert failed, trying base columns:', upsertError.message)
    // Fallback — save with base columns only
    const { error: fallbackError } = await supabase
      .from('products')
      .upsert(cacheProduct, { onConflict: 'barcode' })
    if (fallbackError) {
      console.error('[IngredScan] Base upsert also failed:', fallbackError.message)
    }
  }

  // Extract retailer info from OFF data
  const retailerInfo = extractRetailerInfo(offProduct)

  return NextResponse.json({
    ...product,
    warning: validated.warning,
    data_quality: dataQuality,
    retailer_info: retailerInfo,
  })
}

async function handleCosmeticProduct(
  barcode: string,
  obfProduct: any,
  offProduct: any,
  supabase: any
) {
  // Use whichever source has data, preferring OBF
  const source = obfProduct || offProduct
  if (!source) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const name = source.product_name_en || source.product_name || 'Unknown Product'
  const brand = source.brands || 'Unknown Brand'
  const ingredientsText = source.ingredients_text_en || source.ingredients_text || ''
  const imageUrl = source.image_front_url || ''
  const categories = (source.categories_tags || []).join(', ')

  // Parse INCI ingredients
  const inciNames = parseInciIngredients(ingredientsText)
  const matchedIngredients = matchCosmeticIngredients(inciNames)

  // Detect cosmetic flags from product labels
  const cosmeticFlags = obfProduct
    ? detectCosmeticFlags(obfProduct)
    : {
        is_vegan: false,
        is_cruelty_free: false,
        is_natural: false,
        fragrance_free: !ingredientsText.toUpperCase().includes('PARFUM'),
        alcohol_free: !ingredientsText.toUpperCase().includes('ALCOHOL DENAT'),
        paraben_free: !ingredientsText.toUpperCase().includes('PARABEN'),
        sulphate_free: !ingredientsText.toUpperCase().includes('SULFATE'),
        silicone_free: !ingredientsText.toUpperCase().includes('DIMETHICONE'),
      }

  // Calculate cosmetic score
  const scoring = calculateCosmeticScore(cosmeticFlags, matchedIngredients)

  // Confidence based on data quality
  let confidence = ingredientsText ? 85 : 60
  if (obfProduct) confidence = Math.min(confidence + 5, 95)

  const product = {
    barcode,
    name,
    brand,
    nova_score: 0,
    quality_score: scoring.overallScore,
    nutriscore_grade: '',
    ingredients: ingredientsText,
    additives: [],
    nutrition: {
      energy: null,
      fat: null,
      saturated_fat: null,
      carbs: null,
      sugars: null,
      fibre: null,
      protein: null,
      salt: null,
    },
    image_url: imageUrl,
    data_source: obfProduct ? 'Open Beauty Facts' : 'Open Food Facts',
    confidence,
    category: categories,
    product_type: 'cosmetic' as const,
    inci_ingredients: matchedIngredients,
    cosmetic_concerns: scoring.concerns,
    is_vegan: cosmeticFlags.is_vegan,
    is_cruelty_free: cosmeticFlags.is_cruelty_free,
    is_natural: cosmeticFlags.is_natural,
    fragrance_free: cosmeticFlags.fragrance_free,
    alcohol_free: cosmeticFlags.alcohol_free,
    paraben_free: cosmeticFlags.paraben_free,
    sulphate_free: cosmeticFlags.sulphate_free,
    silicone_free: cosmeticFlags.silicone_free,
    ewg_score: null,
    skin_type: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Save to cache
  const { error: upsertError } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'barcode' })

  if (upsertError) {
    console.error('[IngredScan] Cosmetic product upsert failed:', upsertError.message)
  }

  return NextResponse.json({
    ...product,
    cosmetic_score: scoring,
  })
}
