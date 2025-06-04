import { NextRequest } from 'next/server';
import { createServerClient } from './server';
import { logger } from '@/lib/logger';

/**
 * Helper function to get user JWT from Authorization header
 * This is useful when the client sends the JWT in the Authorization header
 */
export function extractJWTFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return null;
}

/**
 * Create a Supabase client with explicit JWT token for server-side operations
 * This helps avoid the "missing sub claim" error by providing the user's JWT directly
 */
export async function createServerClientWithJWT(request: NextRequest, jwt?: string) {
  // If JWT is provided, create a client and set the session
  if (jwt) {
    const supabase = createServerClient(request);
    await supabase.auth.setSession({
      access_token: jwt,
      refresh_token: '', // We don't need refresh token for this use case
    });
    return supabase;
  }
  
  // Otherwise, use the regular server client with cookies
  return createServerClient(request);
}

/**
 * Get authenticated user ID from server-side Supabase client
 * Handles the "missing sub claim" error gracefully
 */
export async function getAuthenticatedUserID(request?: NextRequest): Promise<string | null> {
  try {
    let supabase;
    
    // If request is provided, try to extract JWT from Authorization header first
    if (request) {
      const jwt = extractJWTFromHeader(request);
      if (jwt) {
        supabase = await createServerClientWithJWT(request, jwt);
      } else {
        // Use regular server client with cookies
        supabase = createServerClient(request);
      }
    } else {
      // Use server client without request (for Server Components)
      supabase = createServerClient();
    }

    // First try to get session to check if we have valid auth context
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.auth.warn('Session error in getAuthenticatedUserID:', sessionError.message);
      return null;
    }

    if (!session) {
      logger.auth.info('No active session found in getAuthenticatedUserID');
      return null;
    }

    // Now get the user with the session context
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      logger.auth.error('Error getting user in getAuthenticatedUserID:', userError.message);
      // Try to fall back to session.user if available
      return session.user?.id || null;
    }

    return user?.id || null;
  } catch (error: any) {
    logger.auth.error('Unexpected error in getAuthenticatedUserID:', error.message);
    return null;
  }
}

/**
 * Check if user is authenticated for server-side operations
 */
export async function isUserAuthenticated(request?: NextRequest): Promise<boolean> {
  const userId = await getAuthenticatedUserID(request);
  return userId !== null;
}
