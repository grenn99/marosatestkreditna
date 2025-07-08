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

/**
 * Get phone number placeholder based on country
 * @param country The selected country
 * @returns Appropriate phone number placeholder
 */
export const getPhonePlaceholder = (country: string): string => {
  switch (country) {
    case 'Slovenija':
      return '041 222 333';
    case 'Hrvaška':
      return '091 222 333';
    case 'Avstrija':
      return '+43 664 123 456';
    case 'Italija':
      return '+39 320 123 456';
    case 'Madžarska':
      return '+36 20 123 456';
    case 'Nemčija':
      return '+49 151 123 456';
    default:
      return '041 222 333';
  }
};

/**
 * Get country calling code
 * @param country The selected country
 * @returns Country calling code with +
 */
export const getCountryCode = (country: string): string => {
  switch (country) {
    case 'Slovenija':
      return '+386';
    case 'Hrvaška':
      return '+385';
    case 'Avstrija':
      return '+43';
    case 'Italija':
      return '+39';
    case 'Madžarska':
      return '+36';
    case 'Nemčija':
      return '+49';
    default:
      return '+386';
  }
};

/**
 * Format phone number based on country
 * @param phone The phone number to format
 * @param country The selected country
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string, country: string): string => {
  if (!phone) return '';

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // For Slovenia, if no country code is provided, format as local number
  if (country === 'Slovenija') {
    // If it starts with +386, remove it for local format
    if (cleaned.startsWith('+386')) {
      const localNumber = cleaned.substring(4);
      return formatSlovenianNumber(localNumber);
    }
    // If it starts with 386 (without +), remove it
    if (cleaned.startsWith('386')) {
      const localNumber = cleaned.substring(3);
      return formatSlovenianNumber(localNumber);
    }
    // If it's already a local number, format it
    return formatSlovenianNumber(cleaned);
  }

  // For other countries, ensure it has the country code
  const countryCode = getCountryCode(country);
  if (!cleaned.startsWith('+')) {
    return `${countryCode} ${cleaned}`;
  }

  return cleaned;
};

/**
 * Format Slovenian phone number (local format without country code)
 * @param number The phone number digits
 * @returns Formatted Slovenian number
 */
const formatSlovenianNumber = (number: string): string => {
  if (!number) return '';

  // Remove any leading zeros
  const cleaned = number.replace(/^0+/, '');

  // Format based on length
  if (cleaned.length === 8) {
    // Mobile: 041 222 333
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  } else if (cleaned.length === 7) {
    // Landline: 01 222 333
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }

  return cleaned;
};
