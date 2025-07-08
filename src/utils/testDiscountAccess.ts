import { supabase } from '../lib/supabaseClient';

/**
 * Test function to check if we can access discount codes
 * This helps debug RLS and database access issues
 */
export async function testDiscountAccess() {
  console.log('Testing discount code database access...');
  
  try {
    // Test 1: Try to fetch all active discount codes
    console.log('Test 1: Fetching all active discount codes...');
    const { data: allCodes, error: allError } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('is_active', true);
    
    if (allError) {
      console.error('Error fetching all codes:', allError);
    } else {
      console.log('All active codes:', allCodes);
    }
    
    // Test 2: Try to fetch a specific discount code
    console.log('Test 2: Fetching BREZPOSTNINE code...');
    const { data: specificCode, error: specificError } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', 'BREZPOSTNINE')
      .eq('is_active', true)
      .single();
    
    if (specificError) {
      console.error('Error fetching BREZPOSTNINE:', specificError);
    } else {
      console.log('BREZPOSTNINE code:', specificCode);
    }
    
    // Test 3: Check RLS status
    console.log('Test 3: Checking table info...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'discount_codes' })
      .single();
    
    if (tableError) {
      console.log('Could not get table info (this is normal):', tableError.message);
    } else {
      console.log('Table info:', tableInfo);
    }
    
    return {
      allCodes: allCodes || [],
      specificCode,
      hasAccess: !allError && !specificError
    };
    
  } catch (error) {
    console.error('Unexpected error testing discount access:', error);
    return {
      allCodes: [],
      specificCode: null,
      hasAccess: false,
      error
    };
  }
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure supabase is initialized
  setTimeout(() => {
    testDiscountAccess();
  }, 1000);
}
