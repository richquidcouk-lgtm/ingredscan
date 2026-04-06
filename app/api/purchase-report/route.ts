import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { barcode, retailer, price, currency, location, userId } = await request.json()

    if (!barcode || !retailer) {
      return NextResponse.json({ error: 'Barcode and retailer required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Store the report
    const { error } = await supabase.from('purchase_reports').insert({
      barcode,
      retailer,
      price: price || null,
      currency: currency || 'GBP',
      location: location || null,
      user_id: userId || null,
    })

    if (error) {
      console.error('[IngredScan] Purchase report failed:', error.message)
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Get purchase reports for a barcode
export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('barcode')
  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // Get distinct retailers and average price
  const { data } = await supabase
    .from('purchase_reports')
    .select('retailer, price, created_at')
    .eq('barcode', barcode)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!data || data.length === 0) {
    return NextResponse.json({ retailers: [], reports: [] })
  }

  // Aggregate retailers with latest price
  const retailerMap = new Map<string, { count: number; latestPrice: number | null }>()
  for (const report of data) {
    const existing = retailerMap.get(report.retailer)
    if (existing) {
      existing.count++
    } else {
      retailerMap.set(report.retailer, { count: 1, latestPrice: report.price })
    }
  }

  const retailers = Array.from(retailerMap.entries()).map(([name, info]) => ({
    name,
    reportCount: info.count,
    latestPrice: info.latestPrice,
  }))

  return NextResponse.json({ retailers, totalReports: data.length })
}
