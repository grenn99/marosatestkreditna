/**
 * Error monitoring utility
 *
 * This module provides functions for tracking and reporting errors
 * in a structured way. It can be extended to integrate with external
 * error tracking services like Sentry.
 */

import { sanitizeLogObject } from './logSanitizer';

// Types of errors we want to track
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  PAYMENT = 'payment',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Structure for error data
export interface ErrorData {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  source: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

// In-memory store for errors (for development/debugging)
const errorStore: ErrorData[] = [];

// Maximum number of errors to store in memory
const MAX_STORED_ERRORS = 100;

/**
 * Track an error with the monitoring system
 *
 * @param error The error object or message
 * @param type The type of error
 * @param severity The severity level
 * @param source The source of the error (component, function, etc.)
 * @param metadata Additional data about the error context
 * @param userId Optional user ID if the error is associated with a user
 */
export function trackError(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  source: string = 'unknown',
  metadata: Record<string, any> = {},
  userId?: string
): void {
  try {
    // Create error data object
    const errorData: ErrorData = {
      type,
      severity,
      message: error instanceof Error ? error.message : error,
      source,
      timestamp: Date.now(),
      userId,
      metadata: sanitizeLogObject(metadata), // Sanitize sensitive data
      stack: error instanceof Error ? error.stack : undefined
    };

    // Store error in memory (for development/debugging)
    errorStore.push(errorData);

    // Limit the size of the error store
    if (errorStore.length > MAX_STORED_ERRORS) {
      errorStore.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      const logMethod = severity === ErrorSeverity.INFO
        ? console.info
        : severity === ErrorSeverity.WARNING
          ? console.warn
          : console.error;

      logMethod(
        `[${severity.toUpperCase()}] [${type}] ${source}: ${errorData.message}`,
        { metadata: errorData.metadata, stack: errorData.stack }
      );
    }

    // TODO: Send to external error tracking service
    // This is where you would integrate with Sentry, LogRocket, etc.
    // Example:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     level: severity,
    //     tags: { type, source },
    //     extra: metadata
    //   });
    // }
  } catch (monitoringError) {
    // Fallback if error tracking itself fails
    console.error('Error in error monitoring:', monitoringError);
  }
}

/**
 * Get all stored errors (for development/debugging)
 */
export function getStoredErrors(): ErrorData[] {
  return [...errorStore];
}

/**
 * Clear all stored errors (for development/debugging)
 */
export function clearStoredErrors(): void {
  errorStore.length = 0;
}

/**
 * Create an error handler function for async operations
 *
 * @param source The source of the error
 * @param type The type of error
 * @param severity The severity level
 * @param metadata Additional data about the error context
 * @param userId Optional user ID if the error is associated with a user
 */
export function createErrorHandler(
  source: string,
  type: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  metadata: Record<string, any> = {},
  userId?: string
): (error: any) => void {
  return (error: any) => {
    trackError(error, type, severity, source, metadata, userId);
  };
}

/**
 * Standard error handler for async operations with toast notifications
 *
 * @param operation The async operation to execute
 * @param options Configuration options for error handling
 * @returns Promise that resolves to the result of the operation or undefined if it fails
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    source: string;
    successMessage?: string;
    errorMessage?: string;
    type?: ErrorType;
    severity?: ErrorSeverity;
    metadata?: Record<string, any>;
    userId?: string;
    showToast?: boolean;
    rethrow?: boolean;
  }
): Promise<T | undefined> {
  const {
    source,
    successMessage,
    errorMessage = 'An error occurred',
    type = ErrorType.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    metadata = {},
    userId,
    showToast = true,
    rethrow = false
  } = options;

  try {
    const result = await operation();

    // Show success toast if specified
    if (showToast && successMessage && typeof window !== 'undefined') {
      // Check if toast library is available
      if (window.toast?.success) {
        window.toast.success(successMessage);
      }
    }

    return result;
  } catch (error) {
    // Track the error
    trackError(error, type, severity, source, metadata, userId);

    // Show error toast if specified
    if (showToast && typeof window !== 'undefined') {
      // Check if toast library is available
      if (window.toast?.error) {
        window.toast.error(errorMessage);
      }
    }

    // Rethrow if specified
    if (rethrow) {
      throw error;
    }

    return undefined;
  }
}

/**
 * Hook for standardized error handling in React components
 *
 * @param defaultOptions Default options for error handling
 * @returns Object with withErrorHandling function
 */
export function useErrorHandler(defaultOptions: {
  source: string;
  type?: ErrorType;
  severity?: ErrorSeverity;
  showToast?: boolean;
  rethrow?: boolean;
}) {
  return {
    withErrorHandling: <T>(
      operation: () => Promise<T>,
      options?: Partial<Parameters<typeof withErrorHandling>[1]>
    ) => withErrorHandling(operation, { ...defaultOptions, ...options })
  };
}
