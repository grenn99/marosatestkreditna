// Test script to verify email system is working
// Run with: node test_email_system.js

const SUPABASE_URL = 'https://wiwjkholoebkzzjoczjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpd2praG9sb2Via3p6am9jempuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTkzNjYsImV4cCI6MjA1ODU3NTM2Nn0.EWWNVXMHQWTwjQdmUuOvmXAJgCxiHepfFOcXEMUZ-sc';

async function testEmailSystem() {
  console.log('🧪 Testing Email System...\n');

  // Test 1: Newsletter Confirmation
  console.log('📧 Test 1: Newsletter Confirmation Email');
  try {
    const newsletterResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'test.newsletter@example.com',
        subject: 'Newsletter Subscription Confirmation',
        body: JSON.stringify({
          html: '<h1>Welcome to our newsletter!</h1><p>Please confirm your subscription.</p>',
          text: 'Welcome to our newsletter! Please confirm your subscription.',
          isConfirmation: true
        }),
        from: 'kmetija.marosa.novice@gmail.com'
      })
    });

    const newsletterResult = await newsletterResponse.json();
    console.log('✅ Newsletter Result:', newsletterResult.success ? 'SUCCESS' : 'FAILED');
    if (!newsletterResult.success) {
      console.log('❌ Error:', newsletterResult.error);
    }
  } catch (error) {
    console.log('❌ Newsletter Test Failed:', error.message);
  }

  console.log('');

  // Test 2: Welcome Email with Discount
  console.log('📧 Test 2: Welcome Email with Discount Code');
  try {
    const welcomeResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'test.welcome@example.com',
        subject: 'Welcome! Your 10% Discount Code',
        body: JSON.stringify({
          html: '<h1>Welcome!</h1><p>Your discount code: <strong>WELCOME10</strong></p>',
          text: 'Welcome! Your discount code: WELCOME10',
          isWelcome: true,
          discountCode: 'WELCOME10'
        }),
        from: 'kmetija.marosa.novice@gmail.com'
      })
    });

    const welcomeResult = await welcomeResponse.json();
    console.log('✅ Welcome Result:', welcomeResult.success ? 'SUCCESS' : 'FAILED');
    if (!welcomeResult.success) {
      console.log('❌ Error:', welcomeResult.error);
    }
  } catch (error) {
    console.log('❌ Welcome Test Failed:', error.message);
  }

  console.log('');

  // Test 3: Order Confirmation
  console.log('📦 Test 3: Order Confirmation Email');
  try {
    const orderResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'test.order@example.com',
        subject: 'Order Confirmation #1101',
        body: JSON.stringify({
          orderId: '1101',
          customerName: 'Test Customer',
          customerEmail: 'test.order@example.com',
          orderTotal: '25.50',
          paymentMethod: 'bank_transfer',
          orderItems: [
            {
              product_name: 'Test Product',
              quantity: 2,
              price_per_unit: 12.75,
              line_total: 25.50
            }
          ],
          shippingAddress: {
            name: 'Test Customer',
            address: 'Test Street 123',
            city: 'Test City',
            postalCode: '1000',
            country: 'Slovenia'
          }
        }),
        from: 'kmetija.marosa.novice@gmail.com'
      })
    });

    const orderResult = await orderResponse.json();
    console.log('✅ Order Result:', orderResult.success ? 'SUCCESS' : 'FAILED');
    if (!orderResult.success) {
      console.log('❌ Error:', orderResult.error);
    }
  } catch (error) {
    console.log('❌ Order Test Failed:', error.message);
  }

  console.log('\n🎯 Email System Test Complete!');
  console.log('📧 Check Google Apps Script executions at:');
  console.log('https://script.google.com/home/executions');
}

// Run the test
testEmailSystem().catch(console.error);
