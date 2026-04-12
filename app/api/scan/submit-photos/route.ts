import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getServiceSupabase } from '@/lib/supabase'
import { scoreProduct, resolveAdditives, extractAdditiveTagsFromText } from '@/lib/scoring'
import { isValidBarcode } from '@/lib/barcode'

const anthropic = new Anthropic()

type ExtractedProduct = {
  product_name: string
  brand: string
  ingredients_text: string
  nutrition_per_100g: {
    energy_kcal: number | null
    fat: number | null
    saturated_fat: number | null
    carbohydrates: number | null
    sugars: number | null
    fibre: number | null
    protein: number | null
    salt: number | null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barcode, photos } = body as {
      barcode: string
      photos: { front: string; ingredients: string; nutrition: string }
    }

    if (!barcode || !isValidBarcode(barcode)) {
      return NextResponse.json({ error: 'Invalid barcode' }, { status: 400 })
    }

    if (!photos?.front || !photos?.ingredients || !photos?.nutrition) {
      return NextResponse.json(
        { error: 'All three photos required (front, ingredients, nutrition)' },
        { status: 400 },
      )
    }

    // Strip data URL prefix if present
    const strip = (b64: string) => b64.replace(/^data:image\/[a-z]+;base64,/, '')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: strip(photos.front),
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: strip(photos.ingredients),
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: strip(photos.nutrition),
              },
            },
            {
              type: 'text',
              text: `You are a food product data extraction assistant. Extract the following from these three product photos (front of pack, ingredients list, nutrition label).

Return ONLY valid JSON, no markdown, no commentary:
{
  "product_name": "exact product name from front of pack",
  "brand": "brand name",
  "ingredients_text": "full ingredients list exactly as printed, preserving order",
  "nutrition_per_100g": {
    "energy_kcal": number or null,
    "fat": number or null,
    "saturated_fat": number or null,
    "carbohydrates": number or null,
    "sugars": number or null,
    "fibre": number or null,
    "protein": number or null,
    "salt": number or null
  }
}

Rules:
- Nutrition values MUST be per 100g. If only per-serving values are shown, calculate per-100g if serving size is visible, otherwise set to null.
- If energy is in kJ only, convert: kcal = kJ / 4.184
- If a field is unreadable or not present, use null — never guess.
- Ingredients text should be the complete list with original punctuation.`,
            },
          ],
        },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'AI extraction failed' }, { status: 500 })
    }

    let extracted: ExtractedProduct
    try {
      const cleaned = textBlock.text.replace(/```json\n?|```\n?/g, '').trim()
      extracted = JSON.parse(cleaned)
    } catch {
      console.error('[submit-photos] Failed to parse AI response:', textBlock.text)
      return NextResponse.json({ error: 'Could not parse extraction result' }, { status: 500 })
    }

    // Build nutriments for scoring
    const n = extracted.nutrition_per_100g
    const nutriments: Record<string, number> = {}
    if (n.energy_kcal != null) nutriments['energy_100g'] = n.energy_kcal * 4.184
    if (n.fat != null) nutriments['fat_100g'] = n.fat
    if (n.saturated_fat != null) nutriments['saturated-fat_100g'] = n.saturated_fat
    if (n.sugars != null) nutriments['sugars_100g'] = n.sugars
    if (n.fibre != null) nutriments['fiber_100g'] = n.fibre
    if (n.protein != null) nutriments['proteins_100g'] = n.protein
    if (n.salt != null) nutriments['salt_100g'] = n.salt

    // Extract additive tags from ingredients text
    const additiveTags = extractAdditiveTagsFromText(extracted.ingredients_text)
    const additives = resolveAdditives(additiveTags)

    // Score the product
    const scored = scoreProduct({
      nutriments,
      additives_tags: additiveTags,
      categories_tags: [],
      labels_tags: [],
      ingredients_text: extracted.ingredients_text,
    })

    const now = new Date().toISOString()
    const product = {
      barcode,
      name: extracted.product_name || 'Unknown Product',
      brand: extracted.brand || '',
      nova_score: scored.nova_score || 0,
      quality_score: scored.quality_score / 10,
      nutriscore_grade: scored.quality_breakdown.nutriscore || '',
      ingredients: extracted.ingredients_text,
      additives: additives.map((a) => ({ code: a.code, name: a.name })),
      nutrition: {
        energy: n.energy_kcal,
        fat: n.fat,
        saturated_fat: n.saturated_fat,
        carbs: n.carbohydrates,
        sugars: n.sugars,
        fibre: n.fibre,
        protein: n.protein,
        salt: n.salt,
      },
      image_url: '',
      data_source: 'user_photo',
      confidence: 80,
      category: '',
      country: 'UK',
      product_type: 'food',
      quality_score_v3: scored.quality_score,
      nutrition_score_v3: scored.quality_breakdown.nutritionScore,
      additive_score_v3: scored.quality_breakdown.additiveScore,
      organic_bonus_v3: scored.quality_breakdown.organicBonus,
      quality_score_breakdown: scored.quality_breakdown,
      quality_score_version: scored.quality_breakdown.version,
      quality_score_updated_at: now,
      created_at: now,
      updated_at: now,
    }

    // Save to DB so next scan is instant
    const supabase = getServiceSupabase()
    await supabase.from('products').upsert(product, { onConflict: 'barcode' })

    return NextResponse.json({
      ...product,
      additives,
      warning: null,
    })
  } catch (err) {
    console.error('[submit-photos] Error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
