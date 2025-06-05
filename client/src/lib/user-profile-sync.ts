/**
 * Utility for synchronizing user profile with Supabase
 */
import { supabase } from '@/lib/supabase/user.client';
import type User from '@/interfaces/user';
import { logger } from '@/lib/logger';

/**
 * Ensures that a user's profile exists in the database after signup
 * @param userId The user's ID
 * @param profileData Initial profile data
 */
export async function ensureUserProfile(
  userId: string, 
  profileData: {
    email?: string;
    username?: string;
    avatar_url?: string;
  }
): Promise<boolean> {
  try {
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // Real error, not just "no rows returned"
      logger.error('Error checking for existing profile:', checkError.message);
      return false;
    }
    
    // If profile exists, no need to create
    if (existingProfile) {
      return true;
    }
    
    // Create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        { 
          user_id: userId,
          username: profileData.username || profileData.email || '',
          avatar_url: profileData.avatar_url || "https://placehold.co/40x40.png?text=Avatar"
        }
      ]);
      
    if (insertError) {
      logger.error('Error creating user profile:', insertError.message);
      return false;
    }
    
    logger.auth.info('Successfully created user profile for:', userId);
    return true;
  } catch (error) {
    logger.error('Unexpected error ensuring user profile:', error);
    return false;
  }
}

/**
 * Syncs the user's metadata between auth and profile tables
 * @param user The user object from auth
 */
export async function syncUserProfile(user: User): Promise<void> {
  if (!user.id) {
    logger.warn('Cannot sync user profile without user ID');
    return;
  }
  
  try {
    // Ensure profile exists
    await ensureUserProfile(user.id, {
      email: user.email,
      username: user.username,
      avatar_url: user.profilePicture
    });
    
    // Update user metadata if needed
    // Additional synchronization logic can be added here
    
  } catch (error) {
    logger.error('Error syncing user profile:', error);
  }
}
