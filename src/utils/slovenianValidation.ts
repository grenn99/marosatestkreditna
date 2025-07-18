/**
 * Validation utilities for Slovenian addresses and phone numbers
 */

/**
 * Validate Slovenian postal code (4 digits: 1000-9999)
 * Major postal codes: 1000 Ljubljana, 2000 Maribor, 3000 Celje, 4000 Kranj, 5000 Nova Gorica
 */
export function validateSlovenianPostalCode(postalCode: string): boolean {
  const cleaned = postalCode.replace(/\s/g, '');
  // Must be exactly 4 digits, starting with 1-9 (not 0)
  const postalCodeRegex = /^[1-9]\d{3}$/;
  return postalCodeRegex.test(cleaned);
}

/**
 * Validate full name (must contain at least first name and last name)
 * Prevents single letters like "darko m"
 */
export function validateFullName(name: string): boolean {
  const trimmed = name.trim();

  // Must be at least 3 characters total
  if (trimmed.length < 3) return false;

  // Split by spaces and filter out empty strings
  const nameParts = trimmed.split(/\s+/).filter(part => part.length > 0);

  // Must have at least 2 parts (first name + last name)
  if (nameParts.length < 2) return false;

  // Each part must be at least 2 characters (no single letters)
  return nameParts.every(part => part.length >= 2);
}

/**
 * Validate Slovenian phone number based on official Wikipedia data
 * Mobile operators and their prefixes:
 * - A1 Slovenija: 030, 040, 068, 069
 * - Telekom Slovenije: 031, 041, 051, 065
 * - Telemach: 070, 071
 * - T-2: 064
 * - Mega M: 065
 * Landline area codes: 01, 02, 03, 04, 05, 07
 */
export function validateSlovenianPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Remove +386 prefix if present
  let withoutCountryCode = cleaned;
  if (cleaned.startsWith('+386')) {
    withoutCountryCode = cleaned.substring(4);
  } else if (cleaned.startsWith('386')) {
    withoutCountryCode = cleaned.substring(3);
  }

  // Mobile numbers (9 digits) - Based on official operator prefixes
  const mobileRegex = /^(030|031|040|041|051|064|065|068|069|070|071)\d{6}$/;

  // Landline numbers (8 digits) - Based on official area codes
  const landlineRegex = /^(01|02|03|04|05|07)\d{6}$/;

  return mobileRegex.test(withoutCountryCode) || landlineRegex.test(withoutCountryCode);
}

/**
 * Format Slovenian phone number for display
 */
export function formatSlovenianPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove +386 prefix if present
  const withoutCountryCode = cleaned.startsWith('+386') 
    ? cleaned.substring(4) 
    : cleaned.startsWith('386') 
    ? cleaned.substring(3)
    : cleaned;
  
  // Format mobile numbers (9 digits)
  if (withoutCountryCode.length === 9) {
    return withoutCountryCode.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Format landline numbers (8 digits)
  if (withoutCountryCode.length === 8) {
    return withoutCountryCode.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return withoutCountryCode;
}

/**
 * Common Slovenian cities for validation/autocomplete
 */
export const SLOVENIAN_CITIES = [
  'Ljubljana',
  'Maribor',
  'Celje',
  'Kranj',
  'Velenje',
  'Koper',
  'Novo mesto',
  'Ptuj',
  'Trbovlje',
  'Kamnik',
  'Jesenice',
  'Nova Gorica',
  'Domžale',
  'Škofja Loka',
  'Murska Sobota',
  'Slovenj Gradec',
  'Krško',
  'Postojna',
  'Litija',
  'Sevnica',
  'Ajdovščina',
  'Idrija',
  'Metlika',
  'Radovljica',
  'Lendava',
  'Piran',
  'Izola',
  'Portorož',
  'Bled',
  'Bohinj',
  'Bovec',
  'Tolmin',
  'Kobarid',
  'Sežana',
  'Divača',
  'Ilirska Bistrica',
  'Ribnica',
  'Kočevje',
  'Črnomelj',
  'Brežice',
  'Trebnje',
  'Grosuplje',
  'Ivančna Gorica',
  'Moravče',
  'Mengeš',
  'Vodice',
  'Komenda',
  'Medvode',
  'Vrhnika',
  'Logatec',
  'Cerknica',
  'Borovnica',
  'Horjul'
];

/**
 * Validate if city is a known Slovenian city (case-insensitive)
 */
export function validateSlovenianCity(city: string): boolean {
  const normalizedCity = city.trim().toLowerCase();
  return SLOVENIAN_CITIES.some(slovenianCity =>
    slovenianCity.toLowerCase() === normalizedCity
  );
}

/**
 * Validate Slovenian address format
 * Must contain street name and house number
 */
export function validateSlovenianAddressFormat(address: string): boolean {
  const trimmed = address.trim();

  // Must be at least 5 characters
  if (trimmed.length < 5) return false;

  // Must contain at least one letter (street name) and one number (house number)
  const hasLetter = /[a-zA-ZčćžšđČĆŽŠĐ]/.test(trimmed);
  const hasNumber = /\d/.test(trimmed);

  if (!hasLetter || !hasNumber) return false;

  // Split by spaces and check structure
  const parts = trimmed.split(/\s+/).filter(part => part.length > 0);

  // Must have at least 2 parts (street name + house number)
  if (parts.length < 2) return false;

  // Check if it looks like a real address (not just random characters)
  const invalidPatterns = [
    /^[a-z]{1,3}\s*\d{1,2}$/i, // Too short like "dsj 3"
    /^[a-z]\s*[a-z]\s*\d$/i,   // Single letters like "d s 3"
    /^[a-z]{1,2}\d+$/i,        // No space like "ds3"
  ];

  return !invalidPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Get city suggestions for autocomplete
 */
export function getSlovenianCitySuggestions(input: string, limit: number = 5): string[] {
  const normalizedInput = input.trim().toLowerCase();
  if (normalizedInput.length < 2) return [];
  
  return SLOVENIAN_CITIES
    .filter(city => city.toLowerCase().startsWith(normalizedInput))
    .slice(0, limit);
}

/**
 * Comprehensive validation for Slovenian address and personal data
 */
export interface SlovenianValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    postalCode?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
}

export function validateSlovenianData(data: {
  name?: string;
  postalCode: string;
  phone?: string;
  city: string;
  address?: string;
}): SlovenianValidationResult {
  const errors: { name?: string; postalCode?: string; phone?: string; city?: string; address?: string } = {};

  // Validate full name if provided
  if (data.name && !validateFullName(data.name)) {
    errors.name = 'Prosimo, vnesite polno ime (ime in priimek, vsaj 2 črki za vsak del)';
  }

  // Validate postal code
  if (!validateSlovenianPostalCode(data.postalCode)) {
    errors.postalCode = 'Prosimo, vnesite veljavno 4-mestno poštno številko (1000-9999)';
  }

  // Validate phone number if provided
  if (data.phone && !validateSlovenianPhoneNumber(data.phone)) {
    errors.phone = 'Prosimo, vnesite veljavno slovensko telefonsko številko (npr. 041234567, 031234567)';
  }

  // Validate address if provided
  if (data.address && !validateSlovenianAddressFormat(data.address)) {
    errors.address = 'Prosimo, vnesite veljaven naslov (npr. Slovenska cesta 1)';
  }

  // Validate city - now with error for invalid cities
  if (!validateSlovenianCity(data.city)) {
    errors.city = 'Prosimo, vnesite veljavno slovensko mesto (npr. Ljubljana, Maribor, Celje)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Keep the old function for backward compatibility
export function validateSlovenianAddress(address: {
  postalCode: string;
  phone?: string;
  city: string;
}): SlovenianValidationResult {
  return validateSlovenianData(address);
}
