/**
 * Helper utility functions for the application
 */

/**
 * Generate a UUID v4
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format a price as a currency string
 * @param price - The price to format
 * @param currency - The currency symbol (default: '€')
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = '€'): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Calculate subtotal from cart items
 * @param items - Array of cart items with price and quantity
 * @returns The calculated subtotal
 */
export function calculateSubtotal(items: Array<{ packageOption: { price: number }, quantity: number }>): number {
  return items.reduce((total, item) => {
    return total + (item.packageOption.price * item.quantity);
  }, 0);
}

/**
 * Check if shipping should be free based on subtotal
 * @param subtotal - The order subtotal
 * @param threshold - The free shipping threshold
 * @returns Boolean indicating if shipping should be free
 */
export function isShippingFree(subtotal: number, threshold: number): boolean {
  return subtotal >= threshold;
}

/**
 * Calculate shipping cost
 * @param subtotal - The order subtotal
 * @param threshold - The free shipping threshold
 * @param shippingCost - The standard shipping cost
 * @returns The calculated shipping cost
 */
export function calculateShippingCost(
  subtotal: number, 
  threshold: number, 
  shippingCost: number
): number {
  return isShippingFree(subtotal, threshold) ? 0 : shippingCost;
}

/**
 * Calculate order total
 * @param subtotal - The order subtotal
 * @param discountAmount - The discount amount
 * @param shippingCost - The shipping cost
 * @param additionalCosts - Any additional costs (gift wrapping, etc.)
 * @returns The calculated order total
 */
export function calculateTotal(
  subtotal: number,
  discountAmount: number = 0,
  shippingCost: number = 0,
  additionalCosts: number = 0
): number {
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  return subtotalAfterDiscount + shippingCost + additionalCosts;
}

/**
 * Validate an email address
 * @param email - The email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate a string to a maximum length
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @param suffix - The suffix to add if truncated (default: '...')
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + suffix;
}

/**
 * Delay execution for a specified time
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a translated field from an object based on the current language
 * @param obj - The object containing translated fields
 * @param fieldName - The base field name
 * @param language - The current language code
 * @returns The translated field value or the default value
 */
export function getTranslatedField(
  obj: Record<string, any>, 
  fieldName: string, 
  language: string
): any {
  const translatedFieldName = `${fieldName}_${language}`;
  return obj[translatedFieldName] || obj[fieldName];
}

/**
 * Check if an object is empty
 * @param obj - The object to check
 * @returns Boolean indicating if the object is empty
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Get a random item from an array
 * @param array - The array to get a random item from
 * @returns A random item from the array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Debounce a function
 * @param func - The function to debounce
 * @param wait - The debounce wait time in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}
