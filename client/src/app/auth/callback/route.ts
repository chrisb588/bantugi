import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      // Redirect to home page after successful authentication
      return NextResponse.redirect(new URL('/', requestUrl))
    } catch (error) {
      console.error('Auth callback error:', error)
      // Redirect to error page if authentication fails
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to verify email', requestUrl)
      )
    }
  }

  // Return to login page if no code present
  return NextResponse.redirect(new URL('/auth/login', requestUrl))
}
