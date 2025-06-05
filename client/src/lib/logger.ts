/**
 * Utility for consistent logging across the application
 * Only logs in development environment to avoid exposing sensitive information
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Checks if the application is running in development mode
 */
const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Logs messages only in development environment
 * @param level Log level (info, warn, error, debug)
 * @param message Main message to log
 * @param optionalParams Additional parameters to log
 */
export const logger = {
  info: (message: string, ...optionalParams: any[]): void => {
    if (isDevelopment()) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  },
  
  warn: (message: string, ...optionalParams: any[]): void => {
    if (isDevelopment()) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  },
  
  error: (message: string, ...optionalParams: any[]): void => {
    // Always log errors for monitoring
    console.error(`[ERROR] ${message}`, ...optionalParams);
  },
  
  debug: (message: string, ...optionalParams: any[]): void => {
    if (isDevelopment()) {
      console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
  },
  
  /**
   * Specialized auth logger for authentication-related logs
   */
  auth: {
    info: (message: string, ...optionalParams: any[]): void => {
      if (isDevelopment()) {
        console.info(`[AUTH] ${message}`, ...optionalParams);
      }
    },
    
    warn: (message: string, ...optionalParams: any[]): void => {
      if (isDevelopment()) {
        console.warn(`[AUTH-WARN] ${message}`, ...optionalParams);
      }
    },
    
    error: (message: string, ...optionalParams: any[]): void => {
      // Always log auth errors for monitoring
      console.error(`[AUTH-ERROR] ${message}`, ...optionalParams);
    },
  }
};
