/**
 * Format a number as currency with the appropriate locale
 * @param amount The amount to format
 * @param locale The locale to use for formatting (defaults to 'sl-SI' for Slovenian)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, locale = 'sl-SI', currency = 'EUR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date with the appropriate locale
 * @param date The date to format
 * @param locale The locale to use for formatting
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, locale = 'sl-SI'): string => {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObject);
};

/**
 * Format a date and time with the appropriate locale
 * @param date The date to format
 * @param locale The locale to use for formatting
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string, locale = 'sl-SI'): string => {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObject);
};

/**
 * Generate a UUID v4 string
 * @returns UUID v4 string
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
