/**
 * Direct email service for sending emails via Google Apps Script
 * This bypasses the Supabase Edge Function and calls the Google Apps Script directly
 */

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

interface GoogleScriptEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  adminEmail: string; // Admin email for notifications
  orderTotal: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  orderDate: string;
  replyToEmail?: string; // Optional reply-to email address (for future use)
}

/**
 * Sends an order confirmation email directly to the Google Apps Script
 *
 * @param orderData The order data to send to the Google Apps Script
 * @returns Promise with the result of the email sending operation
 */
export async function sendDirectOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  orderDetails: {
    items: OrderItem[];
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // Google Apps Script URL - latest deployment
    // Updated to use the new deployment with fixed reply-to address
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuj4GKTJNHO1oB1B3UGvdb3Bhg9kJ4ykX-HgDV9nKDLUF3ZEFM-jZZaMzJBOKHHrDL/exec';
    // Note: For production, you should set up your own CORS proxy or use a more reliable service

    // Admin email for notifications
    const ADMIN_EMAIL = 'marc999933@gmail.com';

    // Format the data as expected by the Google Apps Script
    const emailData: GoogleScriptEmailData = {
      orderId: orderId,
      customerName: customerName,
      customerEmail: customerEmail,
      adminEmail: ADMIN_EMAIL, // Add admin email for notifications
      orderTotal: orderDetails.total.toFixed(2),
      paymentMethod: orderDetails.paymentMethod,
      orderItems: orderDetails.items,
      shippingAddress: orderDetails.shippingAddress,
      orderDate: new Date().toISOString(),
      replyToEmail: 'kmetija.marosa@gmail.com' // Explicitly set the reply-to email
    };

    console.log('Sending order confirmation email directly to Google Apps Script:', emailData);

    // Send the request to the Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    // Parse the response
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response from Google Apps Script:', e);
      responseData = { result: 'error', message: responseText };
    }

    // Check if the request was successful
    if (response.ok && responseData.result === 'success') {
      console.log('Order confirmation email sent successfully via Google Apps Script');
      return {
        success: true,
        message: 'Order confirmation email sent successfully'
      };
    } else {
      console.error('Failed to send order confirmation email via Google Apps Script:', responseData.message);
      return {
        success: false,
        message: `Failed to send email: ${responseData.message || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    console.error('Exception sending email via Google Apps Script:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email'
    };
  }
}
