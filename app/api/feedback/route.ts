import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, email, page } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { error } = await supabase.from('feedback').insert({
      message: message.trim(),
      email: email || null,
      page: page || null,
    })

    if (error) {
      console.error('Feedback insert error:', error)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
