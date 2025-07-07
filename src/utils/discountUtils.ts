import { supabase } from '../lib/supabaseClient';

/**
 * Creates a welcome discount code in the database
 * @param email The email address of the user
 * @returns The discount code or null if there was an error
 */
export async function createWelcomeDiscount(email: string): Promise<string | null> {
  try {
    // Generate a unique discount code based on email
    const discountCode = `WELCOME10_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create a new discount code in the database
    const { error } = await supabase
      .from('discount_codes')
      .insert([
        {
          code: discountCode,
          discount_percent: 10,
          discount_amount: null,
          min_order_amount: null,
          max_uses: 1,
          current_uses: 0,
          valid_from: new Date().toISOString(),
          valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 30 days
          is_active: true,
          description: 'Welcome discount for new subscribers',
          user_email: email
        }
      ]);

    if (error) {
      console.error('Error creating welcome discount:', error);
      return null;
    }

    return discountCode;
  } catch (err) {
    console.error('Unexpected error creating welcome discount:', err);
    return null;
  }
}

/**
 * Validates a discount code
 * @param code The discount code to validate
 * @param orderTotal The total order amount
 * @returns An object with the validation result
 */
export async function validateDiscountCode(code: string, orderTotal: number): Promise<{
  valid: boolean;
  message?: string;
  discountAmount?: number;
  discountPercent?: number;
}> {
  try {
    // Fetch the discount code from the database
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      return { valid: false, message: 'Invalid discount code' };
    }

    // Check if code is valid
    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validTo = data.valid_to ? new Date(data.valid_to) : null;

    if (validFrom > now || (validTo && validTo < now)) {
      return { valid: false, message: 'Expired discount code' };
    }

    // Check if code has reached max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false, message: 'Maximum uses reached' };
    }

    // Check if order meets minimum amount
    if (data.min_order_amount && orderTotal < data.min_order_amount) {
      return { 
        valid: false, 
        message: `Minimum order amount is ${data.min_order_amount} €` 
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (data.discount_percent) {
      discountAmount = (orderTotal * data.discount_percent) / 100;
    } else if (data.discount_amount) {
      discountAmount = data.discount_amount;
    }

    return { 
      valid: true, 
      discountAmount, 
      discountPercent: data.discount_percent 
    };
  } catch (err) {
    console.error('Error validating discount code:', err);
    return { valid: false, message: 'Error validating discount code' };
  }
}

/**
 * Applies a discount code (increments the usage count)
 * @param code The discount code to apply
 * @returns Whether the operation was successful
 */
export async function applyDiscountCode(code: string): Promise<boolean> {
  try {
    // Get the current discount code
    const { data, error: fetchError } = await supabase
      .from('discount_codes')
      .select('current_uses')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (fetchError) {
      return false;
    }

    // Increment the usage count
    const { error: updateError } = await supabase
      .from('discount_codes')
      .update({ current_uses: (data.current_uses || 0) + 1 })
      .eq('code', code.trim().toUpperCase());

    if (updateError) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error applying discount code:', err);
    return false;
  }
}
