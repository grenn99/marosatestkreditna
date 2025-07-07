import { supabase } from '../lib/supabaseClient';
import { CheckoutDisplayItem, OrderItem } from '../types/checkout';
import { generateUUID } from '../utils/helpers';
import { Product } from '../types';

/**
 * Service for handling checkout operations
 */

/**
 * Create a new order in the database
 * @param orderData - The order data to create
 * @returns The created order data or error
 */
export async function createOrder(orderData: {
  order_id: string;
  user_id?: string;
  order_items: OrderItem[];
  shipping_address: any;
  billing_address?: any;
  payment_method: string;
  payment_id?: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  gift_option_cost: number;
  gift_product_cost: number;
  total: number;
  discount_code?: string;
  notes?: string;
  status: string;
}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { data: null, error };
  }
}

/**
 * Update product stock quantities after an order is placed
 * @param orderItems - The ordered items
 * @returns Success status or error
 */
export async function updateProductStock(orderItems: OrderItem[]) {
  try {
    // Group items by product ID to update each product once
    const productUpdates = orderItems.reduce((acc, item) => {
      if (!acc[item.product_id]) {
        acc[item.product_id] = 0;
      }
      acc[item.product_id] += item.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Update each product's stock
    for (const [productId, quantity] of Object.entries(productUpdates)) {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const newStock = Math.max(0, (product.stock_quantity || 0) - quantity);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);

      if (updateError) throw updateError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating product stock:', error);
    return { success: false, error };
  }
}

/**
 * Prepare order items from cart items
 * @param cartItems - The cart items with product details
 * @param language - The current language
 * @returns Array of order items
 */
export function prepareOrderItems(
  cartItems: CheckoutDisplayItem[],
  language: string
): OrderItem[] {
  return cartItems.map(item => ({
    product_id: item.id,
    product_name: item[`name_${language}` as keyof Product] || item.name,
    package_option_id: item.packageOption.uniq_id,
    package_description: item.packageOption.weight?.toString() || item.packageOption.description || '',
    quantity: item.quantity,
    price_per_unit: item.packageOption.price,
    line_total: item.packageOption.price * item.quantity,
    is_gift: item.isGift || false,
    gift_details: item.giftDetails ? JSON.stringify(item.giftDetails) : null,
  }));
}

/**
 * Validate a discount code
 * @param code - The discount code to validate
 * @param subtotal - The current subtotal
 * @returns The discount data or error
 */
export async function validateDiscountCode(code: string, subtotal: number) {
  try {
    // Get the discount from the database
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;

    // Check if the discount is valid
    const now = new Date();
    
    // Check if the discount is expired
    if (discount.expires_at && new Date(discount.expires_at) < now) {
      return { 
        valid: false, 
        error: 'This discount code has expired',
        discount: null 
      };
    }

    // Check if the discount has reached its maximum uses
    if (discount.max_uses && discount.uses >= discount.max_uses) {
      return { 
        valid: false, 
        error: 'This discount code has reached its maximum number of uses',
        discount: null 
      };
    }

    // Check if the order meets the minimum amount
    if (discount.min_order_amount && subtotal < discount.min_order_amount) {
      return { 
        valid: false, 
        error: `This discount requires a minimum order of ${discount.min_order_amount} €`,
        discount: null 
      };
    }

    // Calculate the discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }

    // Return the valid discount
    return { 
      valid: true, 
      error: null,
      discount: {
        ...discount,
        calculatedAmount: discountAmount
      }
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, error: 'Invalid or expired discount code', discount: null };
  }
}

/**
 * Generate a unique order ID
 * @returns A unique order ID string
 */
export function generateOrderId(): string {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
}

/**
 * Send order confirmation email
 * @param orderData - The order data
 * @param email - The customer email
 * @returns Success status or error
 */
export async function sendOrderConfirmationEmail(orderData: any, email: string) {
  try {
    // Call the email service function
    const { error } = await supabase.functions.invoke('send-order-confirmation', {
      body: { orderData, email }
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
}
