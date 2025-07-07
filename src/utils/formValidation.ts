/**
 * Form validation utility
 * 
 * This module provides reusable validation functions for forms.
 */

// Validation result type
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// Validation success result
export const validResult: ValidationResult = { isValid: true };

/**
 * Create a validation error result
 * 
 * @param message The error message
 * @returns A validation result with isValid=false and the provided message
 */
export function invalidResult(message: string): ValidationResult {
  return { isValid: false, message };
}

/**
 * Validate that a value is not empty
 * 
 * @param value The value to validate
 * @param fieldName The name of the field (for the error message)
 * @returns A validation result
 */
export function validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return invalidResult(`${fieldName} is required`);
  }
  return validResult;
}

/**
 * Validate that a value has a minimum length
 * 
 * @param value The value to validate
 * @param minLength The minimum length
 * @param fieldName The name of the field (for the error message)
 * @returns A validation result
 */
export function validateMinLength(value: string | undefined | null, minLength: number, fieldName: string): ValidationResult {
  if (!value || value.length < minLength) {
    return invalidResult(`${fieldName} must be at least ${minLength} characters`);
  }
  return validResult;
}

/**
 * Validate that a value has a maximum length
 * 
 * @param value The value to validate
 * @param maxLength The maximum length
 * @param fieldName The name of the field (for the error message)
 * @returns A validation result
 */
export function validateMaxLength(value: string | undefined | null, maxLength: number, fieldName: string): ValidationResult {
  if (value && value.length > maxLength) {
    return invalidResult(`${fieldName} must be at most ${maxLength} characters`);
  }
  return validResult;
}

/**
 * Validate that a value is a valid email address
 * 
 * @param value The value to validate
 * @returns A validation result
 */
export function validateEmail(value: string | undefined | null): ValidationResult {
  if (!value) {
    return invalidResult('Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return invalidResult('Please enter a valid email address');
  }
  
  return validResult;
}

/**
 * Validate that a value is a valid phone number
 * 
 * @param value The value to validate
 * @returns A validation result
 */
export function validatePhone(value: string | undefined | null): ValidationResult {
  if (!value) {
    return validResult; // Phone might be optional
  }
  
  // Remove spaces, dashes, and parentheses
  const cleanedValue = value.replace(/[\s\-()]/g, '');
  
  // Check if it's a valid phone number (adjust regex as needed for your country format)
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  if (!phoneRegex.test(cleanedValue)) {
    return invalidResult('Please enter a valid phone number');
  }
  
  return validResult;
}

/**
 * Validate that a value is a valid postal code
 * 
 * @param value The value to validate
 * @returns A validation result
 */
export function validatePostalCode(value: string | undefined | null): ValidationResult {
  if (!value) {
    return invalidResult('Postal code is required');
  }
  
  // This is a simple validation for postal codes
  // Adjust the regex for your country's postal code format
  const postalCodeRegex = /^[0-9]{4,10}$/;
  if (!postalCodeRegex.test(value.replace(/\s/g, ''))) {
    return invalidResult('Please enter a valid postal code');
  }
  
  return validResult;
}

/**
 * Validate that a password meets the requirements
 * 
 * @param value The password to validate
 * @returns A validation result
 */
export function validatePassword(value: string | undefined | null): ValidationResult {
  if (!value) {
    return invalidResult('Password is required');
  }
  
  if (value.length < 8) {
    return invalidResult('Password must be at least 8 characters');
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(value)) {
    return invalidResult('Password must contain at least one uppercase letter');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(value)) {
    return invalidResult('Password must contain at least one lowercase letter');
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(value)) {
    return invalidResult('Password must contain at least one number');
  }
  
  // Check for at least one special character
  if (!/[^A-Za-z0-9]/.test(value)) {
    return invalidResult('Password must contain at least one special character');
  }
  
  return validResult;
}

/**
 * Validate that two passwords match
 * 
 * @param password The password
 * @param confirmPassword The confirmation password
 * @returns A validation result
 */
export function validatePasswordMatch(password: string | undefined | null, confirmPassword: string | undefined | null): ValidationResult {
  if (!password || !confirmPassword) {
    return invalidResult('Both password fields are required');
  }
  
  if (password !== confirmPassword) {
    return invalidResult('Passwords do not match');
  }
  
  return validResult;
}

/**
 * Validate a numeric value
 * 
 * @param value The value to validate
 * @param fieldName The name of the field (for the error message)
 * @returns A validation result
 */
export function validateNumeric(value: string | undefined | null, fieldName: string): ValidationResult {
  if (!value) {
    return validResult; // Numeric fields might be optional
  }
  
  if (isNaN(Number(value))) {
    return invalidResult(`${fieldName} must be a number`);
  }
  
  return validResult;
}

/**
 * Validate a numeric value is within a range
 * 
 * @param value The value to validate
 * @param min The minimum value
 * @param max The maximum value
 * @param fieldName The name of the field (for the error message)
 * @returns A validation result
 */
export function validateRange(value: string | number | undefined | null, min: number, max: number, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return validResult; // Range fields might be optional
  }
  
  const numValue = typeof value === 'string' ? Number(value) : value;
  
  if (isNaN(numValue)) {
    return invalidResult(`${fieldName} must be a number`);
  }
  
  if (numValue < min) {
    return invalidResult(`${fieldName} must be at least ${min}`);
  }
  
  if (numValue > max) {
    return invalidResult(`${fieldName} must be at most ${max}`);
  }
  
  return validResult;
}

/**
 * Run multiple validations and return the first error
 * 
 * @param validations Array of validation results
 * @returns The first invalid result, or a valid result if all validations pass
 */
export function runValidations(...validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return validResult;
}
