/**
 * Utility for handling retries in API calls
 */

import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Attempts to execute a function with retries on failure
 * 
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns The result of the function or throws an error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    shouldRetry = () => true,
    onRetry = () => {},
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry based on the error
      if (attempt < maxRetries && shouldRetry(error)) {
        logger.debug(`Retry attempt ${attempt}/${maxRetries}`);
        onRetry(attempt, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        // Either we've exhausted retries or this error shouldn't trigger a retry
        break;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/**
 * Determines if an error is likely to be temporary and worth retrying
 * 
 * @param error The error to check
 * @returns True if the error is likely temporary and worth retrying
 */
export function isRetryableError(error: any): boolean {
  // Network-related errors
  if (error?.message?.includes('network') || 
      error?.message?.includes('timeout') || 
      error?.message?.includes('connection')) {
    return true;
  }
  
  // Supabase rate limiting or server errors
  if (error?.status >= 500 || error?.status === 429) {
    return true;
  }
  
  // JWT token expired (can happen if clock is slightly off)
  if (error?.message?.includes('JWT') && error?.message?.includes('expired')) {
    return true;
  }
  
  return false;
}
