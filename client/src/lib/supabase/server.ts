import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Make the main function synchronous, as per Supabase examples for createServerClient
export function createServerClient(): SupabaseClient {
  const cookieStore = cookies(); // Called in a Route Handler context, this is fine.

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // It's better to throw an error here or handle it appropriately
    // rather than returning a potentially non-functional client.
    throw new Error('Supabase URL or Anon Key is missing from environment variables.');
  }

  return _createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      // Make the individual cookie methods async.
      // Supabase client will await these methods if they are async.
      async get(name: string) {
        return cookieStore.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component or Route Handler.
          // This can sometimes be ignored if middleware is handling session refreshing.
          // Log for debugging, but don't let it crash the request.
          console.warn(`[Supabase Cookie Warning] Failed to set cookie "${name}":`, error);
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          // To remove a cookie, set its value to empty and often an expiry date in the past.
          // The cookieStore.set with an empty value is the common pattern here.
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // Similar to `set`, this can sometimes be ignored.
          console.warn(`[Supabase Cookie Warning] Failed to remove cookie "${name}":`, error);
        }
      },
    },
  });
}