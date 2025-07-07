/**
 * Utility for sanitizing logs to remove sensitive information
 */

// Regular expressions for identifying sensitive data
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;
const ADDRESS_REGEX = /\b\d+\s+[A-Za-z\s]+\b/g;
const NAME_REGEX = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
const POSTAL_CODE_REGEX = /\b\d{4,5}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

/**
 * Sanitize a string by replacing sensitive information with placeholders
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeLogString(input: string): string {
  if (!input || typeof input !== 'string') return input;

  return input
    .replace(EMAIL_REGEX, '[EMAIL]')
    .replace(PHONE_REGEX, '[PHONE]')
    .replace(ADDRESS_REGEX, '[ADDRESS]')
    .replace(NAME_REGEX, '[NAME]')
    .replace(CREDIT_CARD_REGEX, '[CREDIT_CARD]')
    .replace(POSTAL_CODE_REGEX, (match) => {
      // Only replace if it looks like a postal code in context
      if (input.includes('postal') || input.includes('zip') || input.includes('code')) {
        return '[POSTAL_CODE]';
      }
      return match;
    });
}

/**
 * Sanitize an object by replacing sensitive information with placeholders
 * @param obj The object to sanitize
 * @returns A new sanitized object
 */
export function sanitizeLogObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const result = { ...obj };

  // List of sensitive field names to completely redact
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credit_card', 'card',
    'cvv', 'cvc', 'pin', 'ssn', 'social', 'license'
  ];

  // Fields to sanitize but not completely redact
  const fieldsToSanitize = [
    'name', 'email', 'phone', 'address', 'city', 'postalCode', 'postal_code',
    'zip', 'notes', 'message', 'comment', 'description', 'shipping_address',
    'billing_address', 'full_name', 'username', 'telephone_nr'
  ];

  for (const key in result) {
    // Completely redact sensitive fields
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      result[key] = '[REDACTED]';
      continue;
    }

    // Sanitize fields that might contain sensitive info
    if (fieldsToSanitize.some(field => key.toLowerCase().includes(field))) {
      if (typeof result[key] === 'string') {
        result[key] = sanitizeLogString(result[key]);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = sanitizeLogObject(result[key]);
      }
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeLogObject(result[key]);
    }
  }

  return result;
}

/**
 * Safe console.log replacement that sanitizes sensitive information
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export function safeLog(message: any, ...optionalParams: any[]): void {
  // Sanitize the message
  let sanitizedMessage = message;
  if (typeof message === 'string') {
    sanitizedMessage = sanitizeLogString(message);
  } else if (typeof message === 'object' && message !== null) {
    sanitizedMessage = sanitizeLogObject(message);
  }

  // Sanitize optional parameters
  const sanitizedParams = optionalParams.map(param => {
    if (typeof param === 'string') {
      return sanitizeLogString(param);
    } else if (typeof param === 'object' && param !== null) {
      return sanitizeLogObject(param);
    }
    return param;
  });

  // Log the sanitized message and parameters
  console.log(sanitizedMessage, ...sanitizedParams);
}

/**
 * Safe console.error replacement that sanitizes sensitive information
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export function safeError(message: any, ...optionalParams: any[]): void {
  // Sanitize the message
  let sanitizedMessage = message;
  if (typeof message === 'string') {
    sanitizedMessage = sanitizeLogString(message);
  } else if (typeof message === 'object' && message !== null) {
    sanitizedMessage = sanitizeLogObject(message);
  }

  // Sanitize optional parameters
  const sanitizedParams = optionalParams.map(param => {
    if (typeof param === 'string') {
      return sanitizeLogString(param);
    } else if (typeof param === 'object' && param !== null) {
      return sanitizeLogObject(param);
    }
    return param;
  });

  // Log the sanitized message and parameters
  console.error(sanitizedMessage, ...sanitizedParams);
}

// Don't replace console methods automatically to avoid recursion issues
// Instead, export the safe logging functions for manual use
export const safeLogs = {
  log: safeLog,
  error: safeError
};
