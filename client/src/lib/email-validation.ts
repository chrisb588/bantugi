/**
 * Utilities for email validation and checking
 */
import { supabase } from '@/lib/supabase/user.client';
import { logger } from '@/lib/logger';

/**
 * Regular expression for email validation
 * This is a comprehensive regex that follows RFC standards for email validation
 */
const EMAIL_REGEX = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

/**
 * Validate an email address format
 * @param email The email to validate
 * @returns Boolean indicating if the email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Check if an email is already registered in the system
 * This is a more direct way to check if an email exists
 * @param email The email to check
 * @returns Promise resolving to a boolean indicating if the email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    // First, check email format to avoid unnecessary API calls
    if (!isValidEmailFormat(email)) {
      return false; // Invalid format, so not registered
    }

    // First approach: try to start a password reset for this email
    // If the email exists, this will succeed; if not, it will fail
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });

    // If there's no error or the error is about rate limiting,
    // the email exists (Supabase only allows password resets for existing emails)
    if (!error || error.message.includes('rate limit')) {
      logger.auth.info(`Email ${email} is registered (determined by password reset)`);
      return true;
    }

    // Second approach (fallback): try login with a known-wrong password
    // We use this as a fallback because it may generate auth logs we don't want
    if (error.message.includes('Email not confirmed') || error.message.includes('User not found')) {
      return false; // Email definitely doesn't exist
    } else {
      // Try the login approach as a fallback
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: 'email-check-' + Date.now(), // Definitely wrong password
      });

      // If we get "invalid credentials", the email exists but password is wrong
      if (loginError && loginError.message.includes('Invalid login credentials')) {
        logger.auth.info(`Email ${email} is registered (determined by login attempt)`);
        return true;
      }
    }

    // Default to false - couldn't definitively determine the email exists
    return false;

  } catch (error) {
    logger.auth.error('Error checking if email is registered:', error);
    // In case of error, we default to false to allow the signup attempt
    // The actual signup will still fail if the email is registered
    return false;
  }
}
