/**
 * Validation utilities for form inputs
 */

/**
 * Validates phone numbers
 * Accepts formats like:
 * - Slovenian numbers without country code: 041 123 456
 * - Slovenian numbers with country code: +386 41 123 456
 * - International numbers with country code: +1 555 123 4567
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // If empty, return false
  if (!phone || phone.trim() === '') {
    return false;
  }

  // Remove all non-digit characters except the + at the beginning
  const cleanedNumber = phone.trim().replace(/(?!^\+)\D/g, '');

  // Check if it's an international format (starts with +)
  if (cleanedNumber.startsWith('+')) {
    // International numbers should have at least 7 digits after the + sign
    return cleanedNumber.length >= 8; // + and at least 7 digits
  }

  // For Slovenian numbers without country code
  const digitsOnly = phone.replace(/\D/g, '');

  // Slovenian phone numbers should have 8-9 digits without country code
  if (digitsOnly.length < 8 || digitsOnly.length > 9) {
    // Check if it might be a Slovenian number with 386 prefix but without +
    if (digitsOnly.startsWith('386') && (digitsOnly.length === 11 || digitsOnly.length === 12)) {
      const numberWithout386 = digitsOnly.substring(3);
      return isValidSlovenianPrefix(numberWithout386);
    }
    return false;
  }

  // Check if it's a valid Slovenian prefix
  return isValidSlovenianPrefix(digitsOnly);
};

/**
 * Helper function to check if a number has a valid Slovenian prefix
 */
const isValidSlovenianPrefix = (number: string): boolean => {
  // Landline: 01, 02, 03, 04, 05, 07, 08
  // Mobile: 030, 031, 040, 041, 051, 064, 065, 068, 069, 070, 071
  const validPrefixes = [
    // Landlines
    '01', '02', '03', '04', '05', '07', '08',
    // Mobile
    '030', '031', '040', '041', '051', '064', '065', '068', '069', '070', '071'
  ];

  return validPrefixes.some(prefix => number.startsWith(prefix));
};

/**
 * Validates a Slovenian postal code (4 digits)
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  // Slovenian postal code format: 4 digits
  const slovenianPostalCodeRegex = /^\d{4}$/;
  return slovenianPostalCodeRegex.test(postalCode);
};

/**
 * Validates an email address
 */
export const isValidEmail = (email: string): boolean => {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // More comprehensive validation
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check for common domains and TLDs
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const domain = parts[1];

  // Domain should have at least one dot
  if (!domain.includes('.')) {
    return false;
  }

  // Domain should not start or end with a dot
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  // TLD should be at least 2 characters
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  return true;
};

/**
 * Validates a name (at least 2 words, each at least 2 characters)
 */
export const isValidName = (name: string): boolean => {
  if (!name.trim()) {
    return false;
  }

  // Split by spaces and filter out empty strings
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);

  // Check if there are at least 2 words and each word is at least 2 characters
  return words.length >= 2 && words.every(word => word.length >= 2);
};

/**
 * Validates an address (at least 5 characters with a number)
 */
export const isValidAddress = (address: string): boolean => {
  if (!address.trim() || address.trim().length < 5) {
    return false;
  }

  // Address should contain at least one number (house/building number)
  return /\d/.test(address);
};

/**
 * Validates a city name (at least 2 characters)
 */
export const isValidCity = (city: string): boolean => {
  return city.trim().length >= 2;
};

/**
 * Validates a password with strong security requirements:
 * - At least 10 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const isValidPassword = (password: string): boolean => {
  // Check minimum length
  if (password.length < 10) {
    return false;
  }

  // Check for required character types
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

/**
 * Calculates password strength on a scale of 0-100
 * Returns an object with score and feedback
 */
export const calculatePasswordStrength = (password: string): { score: number, feedback: string } => {
  if (!password) {
    return { score: 0, feedback: 'Enter a password' };
  }

  let score = 0;
  let feedback = '';

  // Length check (up to 40 points)
  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;

  // Character variety (up to 60 points)
  if (/[A-Z]/.test(password)) score += 15; // uppercase
  if (/[a-z]/.test(password)) score += 10; // lowercase
  if (/\d/.test(password)) score += 15;    // numbers
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20; // special chars

  // Provide feedback based on score
  if (score < 30) {
    feedback = 'Very weak password';
  } else if (score < 50) {
    feedback = 'Weak password';
  } else if (score < 70) {
    feedback = 'Moderate password';
  } else if (score < 90) {
    feedback = 'Strong password';
  } else {
    feedback = 'Very strong password';
  }

  return { score, feedback };
};
