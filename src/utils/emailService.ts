/**
 * Email service for sending emails via Supabase Functions
 */
import { supabase } from '../lib/supabaseClient';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
}

interface OrderItem {
  product_name: string;
  package_description: string;
  quantity: number;
  price_per_unit: number;
  line_total: number;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

interface OrderDetails {
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

// Email configuration
const DEFAULT_FROM_EMAIL = 'kmetija.marosa.narocila@gmail.com';
const ADMIN_EMAIL = 'kmetija.marosa.narocila@gmail.com'; // Admin email for order notifications

/**
 * Sends an email using Supabase Functions
 *
 * This function calls a Supabase Edge Function that will handle the actual email sending
 * using the Google Apps Script without being blocked by CSP restrictions
 *
 * @param emailData The email data including recipient, subject and body
 * @returns Promise with the result of the email sending operation
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    // Set default sender if not provided
    const emailPayload = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      from: emailData.from || DEFAULT_FROM_EMAIL,
      replyTo: emailData.replyTo || DEFAULT_FROM_EMAIL,
    };

    // Call Supabase Edge Function to send the email
    // This avoids CSP restrictions since the request is made server-side
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailPayload
    });

    if (error) {
      console.error('Error invoking send-email function:', error);
      // Potentially show a user-facing error message here
      throw new Error(`Failed to send email: ${error.message}`);
    }

    // Log the success data from the Edge Function
    console.log('Successfully invoked send-email function, response data:', data);

    // Check if the function's own response indicates success (if your function returns such a field)
    if (data && data.success === false) {
      console.error('Edge function indicated failure:', data.error, data.details);
      throw new Error(`Email service failed: ${data.error || 'Unknown error from function'}`);
    }

    console.log('Email sent successfully via Edge Function.');
    return {
      success: true,
      message: 'Email sent successfully via Supabase Function'
    };
  } catch (error: any) {
    console.error('Exception sending email:', error);
    return { success: false, message: error.message || 'Failed to send email' };
  }
}

/**
 * Sends an order confirmation email to the customer and admin
 *
 * @param orderId The ID of the order
 * @param customerEmail The customer's email address
 * @param customerName The customer's name
 * @param orderDetails Order details to include in the email
 * @returns Promise with the result of the email sending operation
 */
export async function sendOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  orderDetails: OrderDetails
): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure order items are properly formatted for the email
    const formattedOrderItems = orderDetails.items.map(item => {
      // Make sure each item has all required fields in the correct format
      return {
        product_name: item.product_name || '',
        package_description: item.package_description || '',
        quantity: item.quantity || 0,
        price_per_unit: item.price_per_unit || 0,
        line_total: item.line_total || 0
      };
    });

    // Format the data as expected by the Google Apps Script
    const googleScriptData = {
      orderId: orderId,
      orderNumber: orderId.substring(0, 8).toUpperCase(), // Add a shorter order number for display
      customerName: customerName,
      customerEmail: customerEmail,
      adminEmail: ADMIN_EMAIL, // Add admin email for notifications
      orderTotal: orderDetails.total.toFixed(2),
      paymentMethod: orderDetails.paymentMethod,
      orderItems: formattedOrderItems,
      shippingAddress: orderDetails.shippingAddress,
      orderDate: new Date().toISOString(),
      replyToEmail: 'kmetija.marosa.narocila@gmail.com' // Explicitly set the reply-to email
    };

    // Log the order items to help debug
    console.log('Order items being sent in email:', JSON.stringify(formattedOrderItems));

    // MAKE ONLY ONE CALL to the Edge Function
    // The Google Apps Script will handle sending to both customer and admin
    const emailResult = await sendEmail({
      to: customerEmail,
      subject: `Kmetija Maroša - Potrditev naročila #${orderId.substring(0, 8)}`,
      body: JSON.stringify(googleScriptData),
      from: DEFAULT_FROM_EMAIL,
      replyTo: DEFAULT_FROM_EMAIL // Explicitly set reply-to to match from address
    });

    console.log('Email sending result:', emailResult);

    // Return the result
    return {
      success: emailResult.success,
      message: emailResult.message
    };
  } catch (error: any) {
    console.error('Error preparing order confirmation email:', error);
    return { success: false, message: error.message || 'Failed to prepare order confirmation email' };
  }
}
