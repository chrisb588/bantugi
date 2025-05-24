import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase env vars')
  }

  return createClient(url, key)
}