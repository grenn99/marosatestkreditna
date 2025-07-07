import i18n from '../i18n';

/**
 * Utility functions for handling translations
 */

/**
 * Gets a translated field from an object based on the current language
 * with fallback to other languages if the translation is missing
 *
 * @param item The object containing translation fields
 * @param fieldName The base field name without language suffix
 * @param language The current language code
 * @returns The translated field value or fallback
 */
export function getTranslatedField(
  item: any,
  fieldName: string,
  language: string = i18n.language
): string {
  if (!item) return '';

  // Try the requested language first
  const translatedField = item[`${fieldName}_${language}`];
  if (translatedField) return translatedField;

  // Try fallback languages in order of preference
  const fallbackLanguages = ['sl', 'en', 'hr', 'de'];
  for (const fallbackLang of fallbackLanguages) {
    if (fallbackLang !== language) {
      const fallbackField = item[`${fieldName}_${fallbackLang}`];
      if (fallbackField) return fallbackField;
    }
  }

  // Last resort: return the base field
  return item[fieldName] || '';
}

/**
 * Checks if a product has translations for a specific language
 *
 * @param product The product object
 * @param language The language code to check
 * @returns True if the product has translations for the language
 */
export function hasTranslationsForLanguage(
  product: any,
  language: string = i18n.language
): boolean {
  return Boolean(
    product[`name_${language}`] &&
    product[`description_${language}`]
  );
}

/**
 * Format a price according to the current language/locale
 * @param price The price to format
 * @param currencySymbol The currency symbol to use (defaults to €)
 */
export const formatPrice = (
  price: number,
  currencySymbol: string = '€'
): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return `0.00 ${currencySymbol}`;
  }

  // Get the current language
  const currentLang = i18n.language;

  // Define locale mapping
  const localeMap: Record<string, string> = {
    'sl': 'sl-SI',
    'hr': 'hr-HR',
    'de': 'de-DE',
    'en': 'en-GB', // Using British English for European format
  };

  // Get the appropriate locale or fall back to 'en-GB'
  const locale = localeMap[currentLang] || 'en-GB';

  // Format the price
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + ' ' + currencySymbol;
  } catch (error) {
    // Fall back to basic formatting if Intl is not supported
    return price.toFixed(2) + ' ' + currencySymbol;
  }
};

/**
 * Format a date according to the current language/locale
 * @param date The date to format (Date object or ISO string)
 * @param options Intl.DateTimeFormatOptions to customize the format
 */
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  if (!date) return '';

  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Get the current language
  const currentLang = i18n.language;

  // Define locale mapping
  const localeMap: Record<string, string> = {
    'sl': 'sl-SI',
    'hr': 'hr-HR',
    'de': 'de-DE',
    'en': 'en-GB',
  };

  // Get the appropriate locale or fall back to 'en-GB'
  const locale = localeMap[currentLang] || 'en-GB';

  // Format the date
  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    // Fall back to ISO format if Intl is not supported
    return dateObj.toISOString().split('T')[0];
  }
};

/**
 * Check if a translation key exists
 * @param key The translation key to check
 */
export const hasTranslation = (key: string): boolean => {
  return i18n.exists(key);
};

/**
 * Get missing translation keys for the current language
 * @param keys Array of translation keys to check
 * @returns Array of missing keys
 */
export const getMissingTranslations = (keys: string[]): string[] => {
  return keys.filter(key => !hasTranslation(key));
};

/**
 * Get the appropriate translation for a package option description
 * @param option The package option object
 */
export const getTranslatedOptionDescription = (option: any): string => {
  if (!option || !option.description) return '';

  const key = `packageOption.${option.description.toLowerCase().replace(/\s+/g, '_')}`;
  const fallback = option.description;

  return i18n.exists(key) ? i18n.t(key) : fallback;
};
