import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, barcode } = await request.json()

    if (!userId || !barcode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Verify product exists first (it should, since we just fetched it)
    const { data: product } = await supabase
      .from('products')
      .select('barcode')
      .eq('barcode', barcode)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Insert scan record
    const { error } = await supabase.from('scans').insert({
      user_id: userId,
      barcode,
      scanned_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[IngredScan] Failed to record scan:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update daily scan count
    const today = new Date().toISOString().split('T')[0]
    const { data: profile } = await supabase
      .from('profiles')
      .select('scan_count_today, scan_date')
      .eq('id', userId)
      .single()

    const currentCount = profile?.scan_date === today ? (profile?.scan_count_today || 0) : 0

    await supabase
      .from('profiles')
      .update({ scan_count_today: currentCount + 1, scan_date: today })
      .eq('id', userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
