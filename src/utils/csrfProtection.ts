/**
 * CSRF Protection Utilities
 *
 * This module provides functions for generating and validating CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */

/**
 * Generates a new CSRF token and stores it in sessionStorage
 * @returns The generated CSRF token
 */
export function generateCsrfToken(): string {
  // Generate a random token using crypto API if available, or fallback to Math.random
  let token: string;

  if (window.crypto && window.crypto.randomUUID) {
    token = window.crypto.randomUUID();
  } else {
    // Fallback for browsers without crypto.randomUUID
    token = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15) +
            Date.now().toString(36);
  }

  // Store the token in sessionStorage
  sessionStorage.setItem('csrfToken', token);
  return token;
}

/**
 * Retrieves the current CSRF token from sessionStorage
 * @returns The current CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem('csrfToken');
}

/**
 * Validates a CSRF token against the one stored in sessionStorage
 * @param token The token to validate
 * @returns True if the token is valid, false otherwise
 */
export function validateCsrfToken(token: string): boolean {
  const storedToken = getCsrfToken();
  return storedToken !== null && token === storedToken;
}

/**
 * Creates a hidden input element with the CSRF token
 * This function is removed as it requires React JSX, which is not compatible with a pure TypeScript utility file.
 * Instead, use the getCsrfToken() function and add the token to your form manually.
 */
