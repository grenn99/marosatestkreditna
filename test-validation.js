// Test script for Slovenian validation
// Run with: node test-validation.js

// Import the validation functions (we'll simulate them here)
function validateSlovenianPostalCode(postalCode) {
  const cleaned = postalCode.replace(/\s/g, '');
  const postalCodeRegex = /^[1-9]\d{3}$/;
  return postalCodeRegex.test(cleaned);
}

function validateFullName(name) {
  const trimmed = name.trim();
  
  if (trimmed.length < 3) return false;
  
  const nameParts = trimmed.split(/\s+/).filter(part => part.length > 0);
  
  if (nameParts.length < 2) return false;
  
  return nameParts.every(part => part.length >= 2);
}

function validateSlovenianPhoneNumber(phone) {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

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

// Test cases
console.log('=== TESTING SLOVENIAN VALIDATION ===\n');

// Test postal codes
console.log('POSTAL CODES:');
console.log('1000 (Ljubljana):', validateSlovenianPostalCode('1000')); // Should be true
console.log('2000 (Maribor):', validateSlovenianPostalCode('2000')); // Should be true
console.log('123 (invalid):', validateSlovenianPostalCode('123')); // Should be false
console.log('12345 (invalid):', validateSlovenianPostalCode('12345')); // Should be false
console.log('0999 (invalid):', validateSlovenianPostalCode('0999')); // Should be false
console.log('897897 (from user):', validateSlovenianPostalCode('897897')); // Should be false

// Test names
console.log('\nNAMES:');
console.log('darko m (invalid):', validateFullName('darko m')); // Should be false
console.log('Darko Marković (valid):', validateFullName('Darko Marković')); // Should be true
console.log('Ana Novak (valid):', validateFullName('Ana Novak')); // Should be true
console.log('J (invalid):', validateFullName('J')); // Should be false
console.log('John D (invalid):', validateFullName('John D')); // Should be false

// Test phone numbers
console.log('\nPHONE NUMBERS:');
console.log('041234567 (mobile):', validateSlovenianPhoneNumber('041234567')); // Should be true
console.log('031234567 (mobile):', validateSlovenianPhoneNumber('031234567')); // Should be true
console.log('070123456 (mobile):', validateSlovenianPhoneNumber('070123456')); // Should be true
console.log('01234567 (landline):', validateSlovenianPhoneNumber('01234567')); // Should be true
console.log('099 922 19 (from user):', validateSlovenianPhoneNumber('099 922 19')); // Should be false
console.log('123456 (invalid):', validateSlovenianPhoneNumber('123456')); // Should be false
console.log('+386 41 234 567 (should be 041):', validateSlovenianPhoneNumber('+386 41 234 567')); // Should be false - 41 is not valid
console.log('+386 041 234 567 (correct mobile):', validateSlovenianPhoneNumber('+386 041 234 567')); // Should be true

console.log('\n=== TEST COMPLETE ===');
