import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceSupabase(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  return createClient(supabaseUrl, serviceRoleKey)
}

export type Profile = {
  id: string
  email: string
  pro: boolean
  pro_expires_at: string | null
  scan_count_today: number
  scan_date: string | null
  created_at: string
}

export type Product = {
  barcode: string
  name: string
  brand: string
  nova_score: number
  quality_score: number
  nutriscore_grade: string
  ingredients: string
  additives: AdditiveEntry[]
  nutrition: NutritionData
  image_url: string
  data_source: string
  confidence: number
  category: string
  created_at: string
  updated_at: string
}

export type AdditiveEntry = {
  code: string
  name: string
  risk: 'low' | 'medium' | 'high'
  description: string
}

export type NutritionData = {
  energy: number | null
  fat: number | null
  saturated_fat: number | null
  carbs: number | null
  sugars: number | null
  fibre: number | null
  protein: number | null
  salt: number | null
}

export type Scan = {
  id: string
  user_id: string
  barcode: string
  scanned_at: string
}
