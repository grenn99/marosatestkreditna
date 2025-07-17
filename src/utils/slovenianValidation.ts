/**
 * Validation utilities for Slovenian addresses and phone numbers
 */

/**
 * Validate Slovenian postal code (4 digits: 1000-9999)
 */
export function validateSlovenianPostalCode(postalCode: string): boolean {
  const cleaned = postalCode.replace(/\s/g, '');
  const postalCodeRegex = /^[1-9]\d{3}$/;
  return postalCodeRegex.test(cleaned);
}

/**
 * Validate Slovenian phone number
 * Accepts formats: 041234567, 031234567, 070123456, etc.
 * Mobile: 030, 031, 040, 041, 051, 064, 068, 070, 071
 * Landline: 01, 02, 03, 04, 05, 07, 08, 09
 */
export function validateSlovenianPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove +386 prefix if present
  const withoutCountryCode = cleaned.startsWith('+386') 
    ? cleaned.substring(4) 
    : cleaned.startsWith('386') 
    ? cleaned.substring(3)
    : cleaned;
  
  // Mobile numbers (9 digits starting with specific prefixes)
  const mobileRegex = /^(030|031|040|041|051|064|068|070|071)\d{6}$/;
  
  // Landline numbers (8 digits starting with area codes)
  const landlineRegex = /^(01|02|03|04|05|07|08|09)\d{6}$/;
  
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
 * Comprehensive validation for Slovenian address
 */
export interface SlovenianAddressValidation {
  isValid: boolean;
  errors: {
    postalCode?: string;
    phone?: string;
    city?: string;
  };
}

export function validateSlovenianAddress(address: {
  postalCode: string;
  phone?: string;
  city: string;
}): SlovenianAddressValidation {
  const errors: { postalCode?: string; phone?: string; city?: string } = {};
  
  // Validate postal code
  if (!validateSlovenianPostalCode(address.postalCode)) {
    errors.postalCode = 'Prosimo, vnesite veljavno 4-mestno poštno številko (1000-9999)';
  }
  
  // Validate phone number if provided
  if (address.phone && !validateSlovenianPhoneNumber(address.phone)) {
    errors.phone = 'Prosimo, vnesite veljavno slovensko telefonsko številko (npr. 041234567)';
  }
  
  // Validate city (optional - just warn if not recognized)
  if (!validateSlovenianCity(address.city)) {
    // Don't add error, just log for potential autocomplete
    console.log(`City "${address.city}" not in common Slovenian cities list`);
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
