/**
 * Utility functions for authentication error handling
 */

/**
 * Formats authentication errors from Supabase or other sources into user-friendly messages
 * @param error The error object from Supabase or other source
 * @param defaultMessage Default message to show if error can't be parsed
 * @returns A user-friendly error message
 */
export function formatAuthError(error: any, defaultMessage: string = "Authentication failed"): string {
  // If it's null or undefined, return the default message
  if (!error) return defaultMessage;
  
  // Check for Supabase error structure
  if (error.message) {
    // Common Supabase error messages - map to more user-friendly messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes("invalid login credentials")) {
      return "Invalid email or password. Please try again.";
    }
    
    if (errorMessage.includes("email already registered") || 
        errorMessage.includes("already in use") || 
        errorMessage.includes("already exists")) {
      return "This email is already registered. Please use a different email or try logging in.";
    }
    
    if (errorMessage.includes("password")) {
      return "Password error: " + error.message;
    }
    
    if (errorMessage.includes("rate limit")) {
      return "Too many attempts. Please try again later.";
    }
    
    // If we can't map it specifically, at least return the original message
    return error.message;
  }
  
  // For other error structures
  if (error.error_description) return error.error_description;
  if (typeof error === 'string') return error;
  
  // Fallback to default message
  return defaultMessage;
}

/**
 * Determine if an error is related to network connectivity
 * @param error The error object
 * @returns boolean indicating if it's a connectivity error
 */
export function isConnectivityError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error.message || '').toLowerCase();
  
  return errorMessage.includes('network') || 
         errorMessage.includes('connectivity') ||
         errorMessage.includes('connection') ||
         errorMessage.includes('offline');
}
