import { createClient } from './client';
import type { User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';
import UserAuthDetails from '@/interfaces/user-auth';
import type User from '@/interfaces/user';
import { logger } from '@/lib/logger';
import { withRetry, isRetryableError } from '@/lib/retry-utils';
import { isEmailRegistered, isValidEmailFormat } from '@/lib/email-validation';

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
      // If the error is "no rows returned", this might be a new user
      if (error.code === 'PGRST116') {
        // Create a new profile for this user
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              user_id: supabaseUser.id,
              username: baseUser.email || '',
              avatar_url: supabaseUser.user_metadata?.avatar_url || "https://placehold.co/40x40.png?text=Avatar"
            }
          ])
          .select('username, address, avatar_url')
          .single();
          
        if (insertError) {
          console.error('[getCompleteUserProfile] Error creating profile:', insertError.message);
          return baseUser; // Return base user if profile creation fails
        }
        
        // Return merged data with the newly created profile
        return {
          ...baseUser,
          username: newProfile.username || baseUser.email || '',
          address: newProfile.address || undefined,
          profilePicture: newProfile.avatar_url || baseUser.profilePicture,
        };
      }
      
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
  try {
    return await withRetry(
      async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password,
        });

        if (error) {
          logger.auth.error("Sign-in error:", error.message);
          throw error;
        }

        // Get complete user profile including database data
        return data.user ? await getCompleteUserProfile(data.user) : null;
      },
      {
        maxRetries: 2,
        delayMs: 500,
        shouldRetry: (error) => isRetryableError(error),
        onRetry: (attempt, error) => {
          logger.auth.warn(`Retrying login (attempt ${attempt}) after error:`, error.message);
        }
      }
    );
  } catch (error) {
    // Just rethrow the error after retries have been exhausted
    throw error;
  }
}

/**
 * Check if a user with the provided email already exists
 * @param email The email to check
 * @returns Boolean indicating if the email is already in use
 */
async function checkEmailExists(email: string): Promise<boolean> {
  // First, validate email format
  if (!isValidEmailFormat(email)) {
    throw new Error('Invalid email format. Please enter a valid email address.');
  }
  
  // Use our dedicated function to check if email is registered
  return await isEmailRegistered(email);
}

export async function userSignUp(payload: UserAuthDetails): Promise<User | null> {
  try {
    // First check if the email already exists
    const emailExists = await checkEmailExists(payload.email);
    
    if (emailExists) {
      // Throw a standardized error that can be handled by the auth context
      throw new Error('Email already registered. Please use a different email or try logging in.');
    }
    
    // Proceed with signup since email doesn't exist
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: { // This data goes into user_metadata
          avatar_url: "https://placehold.co/40x40.png?text=Avatar", // Placeholder avatar
        }
      }
    });

    if (error) {
      logger.auth.error("Signup error:", error.message);
      throw error;
    }
    
    // Get complete user profile including database data (though for new signups, profile might not exist yet)
    return data.user ? await getCompleteUserProfile(data.user) : null;
  } catch (error) {
    // Rethrow any errors to be handled by the calling function
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // First attempt to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      logger.auth.error("Error getting session:", sessionError.message);
      return null;
    }

    // If no session exists, return null immediately - no need to make the getUser call
    if (!session) {
      logger.auth.info("No active session found");
      return null;
    }

    // We have a session, now get the user
    const { data: { user: userFromGetUser }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError) {
      logger.auth.error("Error getting user:", getUserError.message);
      return null;
    }

    // No user found despite having a session - this is unexpected but possible
    if (!userFromGetUser) {
      logger.auth.warn("Session exists but no user found");
      return null;
    }

    // Get complete user profile including database data
    return await getCompleteUserProfile(userFromGetUser);
  } catch (error) {
    logger.auth.error("Unexpected error in getCurrentUser:", error);
    return null;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({
    scope: 'global' // This ensures all devices/tabs are logged out and all cookies are cleared
  });
  if (error) {
    console.error("Sign-out error:", error.message);
    throw error;
  }
}
