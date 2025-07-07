// Test script to verify the newsletter confirmation flow
// Run this script with Node.js to test the Edge Function

import fetch from 'node-fetch';

// Edge Function URL - your actual Edge Function URL
const EDGE_FUNCTION_URL = 'https://xvjbvfqvnwxnxnfxvnxl.supabase.co/functions/v1/send-email';

// Test sending a welcome email with discount code
async function testWelcomeEmail() {
  console.log('Testing welcome email with discount code...');

  const testEmail = 'marc999933@gmail.com';
  const testDiscountCode = 'WELCOME10_TEST';

  // Generate HTML and text content for the welcome email
  const htmlContent = `
    <html>
      <body>
        <h1>Welcome to Kmetija Maroša!</h1>
        <p>Thank you for subscribing to our newsletter.</p>
        <div style="background-color: #f8f4e5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Special Offer for You</h3>
          <p>As a welcome gift, we're giving you a <strong>10% discount</strong> on your first purchase.</p>
          <p>Use code: <strong style="background-color: #fff; padding: 5px 10px; border: 1px dashed #8B4513;">${testDiscountCode}</strong></p>
          <p>This code is valid for 30 days.</p>
        </div>
        <p>Best regards,<br>The Kmetija Maroša Team</p>
      </body>
    </html>
  `;

  const textContent = `
    Welcome to Kmetija Maroša!

    Thank you for subscribing to our newsletter.

    SPECIAL OFFER FOR YOU
    As a welcome gift, we're giving you a 10% discount on your first purchase.
    Use code: ${testDiscountCode}
    This code is valid for 30 days.

    Best regards,
    The Kmetija Maroša Team
  `;

  // Prepare the payload for the Edge Function
  const payload = {
    to: testEmail,
    subject: 'Welcome to Kmetija Maroša - Your Discount Code',
    body: JSON.stringify({
      html: htmlContent,
      text: textContent,
      isWelcome: true,
      discountCode: testDiscountCode
    }),
    from: 'marc999933@gmail.com',
    replyTo: 'kmetija.marosa@gmail.com'
  };

  try {
    // Call the Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Parse the response
    const result = await response.json();

    // Log the result
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Welcome email test successful!');
    } else {
      console.log('❌ Welcome email test failed!');
    }
  } catch (error) {
    console.error('Error testing welcome email:', error);
  }
}

// Run the tests
async function runTests() {
  await testWelcomeEmail();
}

runTests().catch(console.error);
