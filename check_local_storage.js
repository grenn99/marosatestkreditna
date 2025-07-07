// Script to check local storage flags
console.log('Checking local storage flags for newsletter popup:');
console.log('welcome_discount_shown:', localStorage.getItem('welcome_discount_shown'));
console.log('welcome_discount_temp_hidden:', localStorage.getItem('welcome_discount_temp_hidden'));
console.log('welcome_discount_temp_hidden_until:', localStorage.getItem('welcome_discount_temp_hidden_until'));

// Clear all flags if needed
// localStorage.removeItem('welcome_discount_shown');
// localStorage.removeItem('welcome_discount_temp_hidden');
// localStorage.removeItem('welcome_discount_temp_hidden_until');
// console.log('All flags cleared');
