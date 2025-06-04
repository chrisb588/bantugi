import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

export function createServerClient(request: NextRequest, response: NextResponse): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = request.cookies;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: async (key: string) => {
          return cookieStore.get(key)?.value ?? null;
        },
        setItem: async (key: string, value: string) => {
          response.cookies.set(key, value, { path: '/' });
        },
        removeItem: async (key: string) => {
          response.cookies.set(key, '', { path: '/', maxAge: 0 });
        },
      },
    },
  });
}
