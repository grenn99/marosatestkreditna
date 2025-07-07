/**
 * Error Handling Utilities
 * 
 * This module provides functions for centralized error handling,
 * logging, and sanitization to prevent information leakage.
 */

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Define error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  API = 'api',
  NETWORK = 'network',
  DATABASE = 'database',
  UNKNOWN = 'unknown'
}

// Error interface
export interface AppError {
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: string;
  data?: any;
  stack?: string;
}

// Sensitive patterns to redact
const SENSITIVE_PATTERNS = [
  // API Keys
  { pattern: /(pk|sk)_(test|live)_[A-Za-z0-9]+/g, replacement: '***API_KEY***' },
  // JWT Tokens
  { pattern: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, replacement: '***JWT_TOKEN***' },
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '***EMAIL***' },
  // Phone numbers
  { pattern: /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, replacement: '***PHONE***' },
  // IP addresses
  { pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, replacement: '***IP***' },
  // Database connection strings
  { pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@.+/g, replacement: '***DB_CONNECTION***' },
];

/**
 * Sanitizes error data by redacting sensitive information
 * 
 * @param data The data to sanitize
 * @returns Sanitized data with sensitive information redacted
 */
export function sanitizeErrorData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    let sanitized = data;
    SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
      sanitized = sanitized.replace(pattern, replacement);
    });
    return sanitized;
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeErrorData(item));
    }
    
    const sanitized: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeErrorData(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Creates a standardized error object
 * 
 * @param error The original error
 * @param userMessage A user-friendly message
 * @param category The error category
 * @param severity The error severity
 * @param additionalData Additional data to include
 * @returns A standardized AppError object
 */
export function createAppError(
  error: Error | string,
  userMessage: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  additionalData?: any
): AppError {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;
  
  const appError: AppError = {
    message: sanitizeErrorData(errorMessage),
    userMessage,
    severity,
    category,
    timestamp: new Date().toISOString(),
    stack: sanitizeErrorData(stack),
  };
  
  if (additionalData) {
    appError.data = sanitizeErrorData(additionalData);
  }
  
  return appError;
}

/**
 * Logs an error to the console and optionally to a monitoring service
 * 
 * @param error The error to log
 */
export function logError(error: AppError): void {
  // Log to console with appropriate level
  switch (error.severity) {
    case ErrorSeverity.INFO:
      console.info(`[${error.category}] ${error.message}`, error);
      break;
    case ErrorSeverity.WARNING:
      console.warn(`[${error.category}] ${error.message}`, error);
      break;
    case ErrorSeverity.CRITICAL:
      console.error(`[CRITICAL] [${error.category}] ${error.message}`, error);
      break;
    case ErrorSeverity.ERROR:
    default:
      console.error(`[${error.category}] ${error.message}`, error);
      break;
  }
  
  // TODO: Add integration with a monitoring service like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   sendToMonitoringService(error);
  // }
}

/**
 * Handles an error by logging it and returning a user-friendly message
 * 
 * @param error The original error
 * @param userMessage A user-friendly message
 * @param category The error category
 * @param severity The error severity
 * @param additionalData Additional data to include
 * @returns The user-friendly message
 */
export function handleError(
  error: Error | string,
  userMessage: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  additionalData?: any
): string {
  const appError = createAppError(error, userMessage, category, severity, additionalData);
  logError(appError);
  return appError.userMessage;
}

/**
 * Handles an API error by logging it and returning a user-friendly message
 * 
 * @param error The original error
 * @param userMessage A user-friendly message
 * @returns The user-friendly message
 */
export function handleApiError(error: Error | string, userMessage: string): string {
  return handleError(error, userMessage, ErrorCategory.API, ErrorSeverity.ERROR);
}

/**
 * Handles an authentication error by logging it and returning a user-friendly message
 * 
 * @param error The original error
 * @param userMessage A user-friendly message
 * @returns The user-friendly message
 */
export function handleAuthError(error: Error | string, userMessage: string): string {
  return handleError(error, userMessage, ErrorCategory.AUTHENTICATION, ErrorSeverity.WARNING);
}

/**
 * Handles a validation error by logging it and returning a user-friendly message
 * 
 * @param error The original error
 * @param userMessage A user-friendly message
 * @returns The user-friendly message
 */
export function handleValidationError(error: Error | string, userMessage: string): string {
  return handleError(error, userMessage, ErrorCategory.VALIDATION, ErrorSeverity.INFO);
}
