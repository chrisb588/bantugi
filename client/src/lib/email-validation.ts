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
 * Uses a secure server-side edge function to check auth.users table
 * @param email The email to check
 * @returns Promise resolving to a boolean indicating if the email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    // First, check email format to avoid unnecessary API calls
    if (!isValidEmailFormat(email)) {
      return false; // Invalid format, so not registered
    }

    // Use the Edge Function to securely check if the email exists
    const result = await checkEmailExists(email);
    
    if (result && result.exists === true) {
      logger.auth.info(`Email ${email} is registered (verified by edge function)`);
      return true;
    }
    
    return false;

  } catch (error) {
    logger.auth.error('Error checking if email is registered:', error);
    // In case of error, we default to false to allow the signup attempt
    // The actual signup will still fail if the email is registered
    return false;
  }
}


/**
 * Check if an email exists using a Supabase Edge Function
 * @param email The email to check
 * @returns Promise resolving to the response data from the edge function
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('check-email-existence', {
      body: { email }
    });

    if (error) {
      logger.auth.error('Error invoking check-email-existence function:', error);
      throw error;
    }

    return data as { exists: boolean };
  } catch (error) {
    logger.auth.error('Error checking email:', error);
    throw error;
  }
}

/**
 * Alternative: Direct fetch approach to check if an email exists
 * @param email The email to check
 * @returns Promise resolving to the response data from the edge function
 */
export async function checkEmailExistsFetch(email: string): Promise<{ exists: boolean }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/check-email-existence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey || ''}`,
        'apikey': supabaseAnonKey || ''
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as { exists: boolean };
  } catch (error) {
    logger.auth.error('Error checking email:', error);
    throw error;
  }
}