import { createClient } from './client';
import type { User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';
import UserAuthDetails from '@/interfaces/user-auth';
import type User from '@/interfaces/user';

// Create a single instance of the Supabase client
const supabase: SupabaseClient = createClient();

// Export the supabase client instance
export { supabase };

// Helper function to adapt Supabase user to your User interface
function adaptSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    username: supabaseUser.user_metadata?.username || supabaseUser.email || '', 
    email: supabaseUser.email || '',
    profilePicture: supabaseUser.user_metadata?.avatar_url || undefined,
    address: supabaseUser.user_metadata?.address || undefined,
    emailConfirmedAt: supabaseUser.email_confirmed_at,
    // location can be added later if needed
  };
}

// Enhanced function to get complete user profile from database
async function getCompleteUserProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  try {
    // First get the basic user data from auth
    const baseUser = adaptSupabaseUser(supabaseUser);
    if (!baseUser) return null;

    // Then fetch the profile data from database
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('username, address, avatar_url')
      .eq('user_id', supabaseUser.id)
      .single();

    if (error) {
      console.warn('[getCompleteUserProfile] Could not fetch profile data:', error.message);
      // Return base user data if profile fetch fails
      return baseUser;
    }

    // Merge profile data with auth data
    return {
      ...baseUser,
      username: profileData.username || baseUser.email || '',
      address: profileData.address || undefined,
      profilePicture: profileData.avatar_url || baseUser.profilePicture,
    };
  } catch (error) {
    console.error('[getCompleteUserProfile] Error:', error);
    // Fallback to basic user data
    return adaptSupabaseUser(supabaseUser);
  }
}

export async function signInWithPassword(payload: UserAuthDetails): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.username, // Assuming payload.username is the email
    password: payload.password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    throw error;
  }

  // Get complete user profile including database data
  return data.user ? await getCompleteUserProfile(data.user) : null;
}

export async function userSignUp(payload: UserAuthDetails): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.username, // Assuming payload.username is the email
    password: payload.password,
  });

  if (error) {
    console.error("Signup error:", error.message);
    throw error;
  }
  // Get complete user profile including database data (though for new signups, profile might not exist yet)
  return data.user ? await getCompleteUserProfile(data.user) : null;
}

export async function getCurrentUser(): Promise<User | null> {
  console.log("[SupabaseClient] Attempting to get current user session...");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("[SupabaseClient] Error getting session:", sessionError.message, sessionError);
    // It's possible getSession fails but getUser might still work with a persisted token,
    // or if the error is transient. So, we'll still proceed to getUser.
  }

  if (!session) {
    console.log("[SupabaseClient] No active session found by getSession().");
    // This is a common scenario if the user is not logged in or session expired and couldn't be refreshed.
  } else {
    console.log("[SupabaseClient] Active session found by getSession():", {
      accessToken: session.access_token.substring(0, 20) + "...", // Log a snippet
      refreshToken: session.refresh_token ? session.refresh_token.substring(0, 20) + "..." : "N/A",
      user: session.user ? { id: session.user.id, email: session.user.email, aud: session.user.aud } : null,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      expiresIn: session.expires_in
    });
  }

  console.log("[SupabaseClient] Calling supabase.auth.getUser()...");
  // No explicit token is passed to supabase.auth.getUser() here.
  // The Supabase client library will use the token from its internal storage (managed via getSession/setSession and cookies/localStorage).
  const { data: { user: userFromGetUser }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError) {
    console.error("[SupabaseClient] Error from supabase.auth.getUser():", getUserError.message, getUserError);
    if (session && session.user) {
      console.warn("[SupabaseClient] supabase.auth.getUser() failed. User from getSession() was:", {
         id: session.user.id, email: session.user.email, aud: session.user.aud 
      });
    } else if (session) {
      console.warn("[SupabaseClient] supabase.auth.getUser() failed. Session existed but had no user object. Session data:", {
        accessToken: session.access_token.substring(0, 20) + "...",
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      });
    } else {
      console.warn("[SupabaseClient] supabase.auth.getUser() failed, and no session was found by getSession() either.");
    }
    return null; 
  }
  
  if (userFromGetUser) {
    console.log("[SupabaseClient] User successfully retrieved by supabase.auth.getUser():", { 
      id: userFromGetUser.id, 
      email: userFromGetUser.email, 
      aud: userFromGetUser.aud,
      // You can add more fields from userFromGetUser if needed for debugging
      // For example: userFromGetUser.email_confirmed_at, userFromGetUser.created_at
    });
  } else {
    console.log("[SupabaseClient] supabase.auth.getUser() returned no user, but also no error.");
    // This case might happen if the session from getSession() was null or invalid,
    // and getUser() confirmed there's no authenticated user.
  }
  
  // Get complete user profile including database data
  return userFromGetUser ? await getCompleteUserProfile(userFromGetUser) : null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign-out error:", error.message);
    throw error;
  }
}
