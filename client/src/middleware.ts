import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Update request cookies for the Supabase client to read its own writes if needed
              request.cookies.set({ name, value, ...options });
              // Update response cookies to send back to the browser
              response.cookies.set({ name, value, ...options });
            });
          } catch (error) {
            // Handle potential errors during cookie setting, e.g., if headers were already sent
            // console.error("Error setting cookies in middleware:", error);
          }
        },
      },
    }
  );

  // Refresh session if expired - crucial for Server Components
  // and for keeping the client-side session alive
  const { data: { session } } = await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
