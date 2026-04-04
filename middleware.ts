import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const protectedRoutes = ['/history', '/account', '/favourites']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for Supabase auth token in cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('sb-access-token')?.value
    || request.cookies.get(`sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`)?.value

  if (!accessToken) {
    // Let the client-side handle auth redirect with modal
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/history/:path*', '/account/:path*', '/favourites/:path*'],
}
