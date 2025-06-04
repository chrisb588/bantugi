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
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error refreshing session in middleware:", error.message);
      // Continue with the request even if session refresh failed
      // The user experience will be that they are logged out
    }
    
    // If there's a protected route pattern we want to enforce, we could check here
    // For example, redirecting from /dashboard to /login if no session
    
    // For now, we'll just refresh the session and continue
    
  } catch (e) {
    console.error("Unexpected error in middleware session refresh:", e);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
