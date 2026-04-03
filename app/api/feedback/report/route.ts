import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barcode, issue_type, description } = body

    if (!barcode || !issue_type) {
      return NextResponse.json({ error: 'Barcode and issue_type are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { error } = await supabase.from('product_reports').insert({
      barcode,
      issue_type,
      description: description || null,
    })

    if (error) {
      console.error('Product report insert error:', error)
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
