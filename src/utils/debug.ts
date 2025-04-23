/**
 * Debug utility functions for enhanced logging
 */

// Check if we're running in debug mode
const isDebugMode = import.meta.env.VITE_DEBUG === 'true';

/**
 * Debug logger that only logs in debug mode
 * @param area - The area/component where the log is coming from
 * @param message - The message to log
 * @param data - Optional data to log
 */
export const debug = (area: string, message: string, data?: any) => {
  if (isDebugMode) {
    console.log(`[DEBUG][${area}] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * Error logger that always logs errors, but with extra detail in debug mode
 * @param area - The area/component where the error occurred
 * @param message - The error message
 * @param error - The error object
 */
export const logError = (area: string, message: string, error: any) => {
  if (isDebugMode) {
    console.error(`[ERROR][${area}] ${message}`, error);
  } else {
    console.error(`[ERROR][${area}] ${message}`);
  }
};

/**
 * Log API request details
 * @param method - HTTP method
 * @param url - Request URL
 * @param params - URL parameters
 * @param data - Request body
 */
export const logRequest = (method: string, url: string, params?: any, data?: any) => {
  if (isDebugMode) {
    console.log(`[API REQUEST] ${method} ${url}`, {
      params,
      data,
    });
  }
};

/**
 * Log API response details
 * @param method - HTTP method
 * @param url - Request URL
 * @param status - Response status
 * @param data - Response data
 */
export const logResponse = (method: string, url: string, status: number, data: any) => {
  if (isDebugMode) {
    console.log(`[API RESPONSE] ${method} ${url} - Status: ${status}`, data);
  }
};

/**
 * Create a labeled performance timer
 * @param label - Timer label
 * @returns Function to end and log the timer
 */
export const startTimer = (label: string) => {
  if (!isDebugMode) return () => {};
  
  console.time(`[PERFORMANCE][${label}]`);
  return () => {
    console.timeEnd(`[PERFORMANCE][${label}]`);
  };
};

/**
 * Log component lifecycle events
 * @param component - Component name
 * @param event - Lifecycle event (mount, update, unmount)
 * @param props - Component props
 */
export const logLifecycle = (component: string, event: 'mount' | 'update' | 'unmount', props?: any) => {
  if (isDebugMode) {
    console.log(`[LIFECYCLE][${component}] ${event}`, props || '');
  }
};

export default {
  debug,
  logError,
  logRequest,
  logResponse,
  startTimer,
  logLifecycle,
  isDebugMode,
}; 