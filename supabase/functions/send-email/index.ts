// Supabase Edge Function to send emails via Google Apps Script
// This function acts as a proxy between the frontend and Google Apps Script
// to avoid Content Security Policy (CSP) restrictions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Admin email for notifications
const ADMIN_EMAIL = 'marc999933@gmail.com';

// Simple request deduplication cache to prevent duplicate emails
// This is a basic in-memory cache that will be reset when the function is redeployed
// For a more robust solution, consider using a database or KV store
const requestCache = new Map<string, {timestamp: number, processed: boolean}>();

// Function to generate a cache key from the request data
function generateCacheKey(emailData: any): string {
  // For welcome emails, create a key based on email and isWelcome flag
  // Don't include timestamp in the key to better catch duplicates
  if (emailData.body && typeof emailData.body === 'string') {
    try {
      const parsedBody = JSON.parse(emailData.body);
      if (parsedBody.isWelcome) {
        return `welcome_${emailData.to}`;
      }
    } catch (e) {
      // If parsing fails, fall through to default key generation
    }
  } else if (emailData.body && typeof emailData.body === 'object' && emailData.body.isWelcome) {
    return `welcome_${emailData.to}`;
  } else if (emailData.isWelcome) {
    return `welcome_${emailData.to}`;
  }

  // Default key generation - include minute-level timestamp to allow similar emails after a time
  return `${emailData.to}_${emailData.subject}_${Date.now().toString().slice(0, -3)}`;
}

serve(async (req: Request) => {
  try {
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: corsHeaders
      });
    }

    // Hardcoded Google Apps Script URL - latest deployment with fixed reply-to address
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxE10OFGBoSVGRFBk304KTgu1txHxFXIq97mE4xN05wQnQf2v_815uKT_LoXZYOebXqZg/exec';

    if (!googleScriptUrl) {
      console.error('Google Script URL not available');
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error: Google Script URL not found.'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    // Parse the request body
    const emailData = await req.json();

    // Validate required fields from client
    if (!emailData.to || !emailData.subject || !emailData.body) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields (to, subject, body)'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Check for welcome email to implement deduplication
    let isWelcomeEmail = false;
    if (typeof emailData.body === 'string') {
      try {
        const parsedBody = JSON.parse(emailData.body);
        isWelcomeEmail = parsedBody.isWelcome === true;
      } catch (e) {
        // Not JSON or not a welcome email
      }
    }

    // Generate a cache key for this request
    const cacheKey = generateCacheKey(emailData);

    // Check if this is a duplicate request (especially for welcome emails)
    if (isWelcomeEmail) {
      console.log(`Processing welcome email for ${emailData.to}, checking cache with key: ${cacheKey}`);

      // Check if we've seen this request recently (within last 60 seconds)
      const cachedRequest = requestCache.get(cacheKey);
      if (cachedRequest && cachedRequest.processed) {
        console.log(`Duplicate welcome email detected for ${emailData.to}, returning cached response`);
        return new Response(JSON.stringify({
          success: true,
          message: 'Email already processed (duplicate request detected).',
          isDuplicate: true
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        });
      }

      // Mark this request as being processed
      requestCache.set(cacheKey, {
        timestamp: Date.now(),
        processed: false // Will be set to true after successful processing
      });

      console.log(`New welcome email request for ${emailData.to}, proceeding with processing`);
    }

    // Try to parse the body as JSON if it's a string that looks like JSON
    let parsedBody = emailData.body;

    try {
      if (typeof emailData.body === 'string' &&
          (emailData.body.startsWith('{') || emailData.body.startsWith('['))) {
        parsedBody = JSON.parse(emailData.body);

        // Check for isConfirmation flag inside the parsed body, which indicates newsletter/welcome type content structure
        if (parsedBody.isConfirmation === true || parsedBody.isWelcome === true) {
          console.log('Found isConfirmation/isWelcome flag in parsed body, treating as HTML/Text content body.');
        }
      }
    } catch (e) {
      console.log('Body is not valid JSON, using as is:', emailData.body);
      // If body is not JSON, it's unlikely to be a newsletter/welcome email with HTML/Text content structure
      // It's more likely plain text or a structure for order confirmation that doesn't rely on inner html/text fields.
    }

    // Prepare the payload for Google Apps Script
    let googleScriptPayload: Record<string, any>;

    const commonEmailProperties = {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from,
      replyTo: 'kmetija.marosa@gmail.com',
    };

    // Check if parsedBody itself indicates it's a newsletter or welcome email
    // These types have a specific structure where parsedBody contains {html, text, isConfirmation?, isWelcome?}
    if (parsedBody && typeof parsedBody === 'object' && (parsedBody.isConfirmation || parsedBody.isWelcome)) {
      // For welcome emails, ensure discount code is included at the top level
      const isWelcomeEmail = parsedBody.isWelcome === true;

      // Extract discount code from multiple possible locations
      let discountCode: string | undefined;
      if (isWelcomeEmail) {
        // Try to get discount code from top level first
        if (parsedBody.discountCode) {
          discountCode = parsedBody.discountCode;
          console.log(`Found discount code at top level: ${discountCode}`);
        }
        // Then try from body if it's nested
        else if (typeof parsedBody.body === 'object' && parsedBody.body.discountCode) {
          discountCode = parsedBody.body.discountCode;
          console.log(`Found discount code in nested body: ${discountCode}`);
        }
      }

      if (isWelcomeEmail && discountCode) {
        console.log(`Including discount code in welcome email: ${discountCode}`);
      } else if (isWelcomeEmail) {
        console.log(`Warning: No discount code found for welcome email to: ${emailData.to}`);
      }

      googleScriptPayload = {
        ...commonEmailProperties,
        isConfirmation: parsedBody.isConfirmation || false, // Pass true if newsletter for GAS routing
        isWelcome: parsedBody.isWelcome || false,          // Pass true if welcome for GAS routing
        discountCode: discountCode, // Explicitly include discount code at top level
        body: parsedBody, // The body for GAS will be { html: "...", text: "...", ...}
        // adminEmail for these types might be in parsedBody.recipients.admin
        adminEmail: parsedBody.recipients?.admin || ADMIN_EMAIL,
      };
    } else {
      // Handles order confirmations (where parsedBody has order_id etc. at top level)
      // or plain text emails where emailData.body was a simple string.
      googleScriptPayload = {
        ...commonEmailProperties,
        // Spread fields from parsedBody if it's an object (e.g., for order confirmations)
        // This will include orderId, customerName, customerEmail, adminEmail, etc.
        ...(typeof parsedBody === 'object' ? parsedBody : {}),
        // If parsedBody was not an object (i.e., emailData.body was a plain string),
        // assign it directly to googleScriptPayload.body.
        // This ensures plain text emails are passed correctly.
        body: typeof parsedBody !== 'object' ? emailData.body : (parsedBody.body || parsedBody), // If parsedBody is an object but doesn't have html/text, use it as body, or its own body property if exists
      };
      // For order confirmations, parsedBody already contains adminEmail, customerEmail etc.
      // The spread operator `...parsedBody` handles this.
      // If `parsedBody` doesn't have an `adminEmail`, the one from `ADMIN_EMAIL` (if defined globally) could be a fallback
      // but typically order data includes specific admin/customer emails.
      if (!googleScriptPayload.adminEmail && ADMIN_EMAIL) {
        googleScriptPayload.adminEmail = ADMIN_EMAIL;
      }
    }

    console.log('Final googleScriptPayload:', JSON.stringify(googleScriptPayload, null, 2));

    // Log detailed information about the email being sent
    console.log(`Sending email to ${emailData.to} via Google Apps Script`);
    console.log(`Email type: ${parsedBody?.recipientType || 'unknown'}`);
    console.log(`Recipients config:`, JSON.stringify(parsedBody?.recipients || 'not specified'));

    // Only log a summary of the payload to avoid cluttering logs
    console.log('Payload summary:', {
      to: googleScriptPayload.to,
      subject: googleScriptPayload.subject,
      customerEmail: googleScriptPayload.customerEmail,
      adminEmail: googleScriptPayload.adminEmail,
      recipientType: googleScriptPayload.recipientType,
      sendToMarosa: googleScriptPayload.sendToMarosa
    });

    // Call the Google Apps Script to send the email
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleScriptPayload)
    });

    const responseText = await response.text();
    console.log('Google Apps Script response text:', responseText);

    // Handle the response from Google Apps Script
    if (!response.ok) {
      console.error('Error from Google Apps Script:', responseText);
      return new Response(JSON.stringify({
        success: false,
        error: `Google Apps Script error: ${responseText}`
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: response.status // Use actual status from Google Script
      });
    }

    // Try to parse JSON, but handle plain text response too
    let resultJson = null;
    try {
      resultJson = JSON.parse(responseText);
      console.log('Successfully parsed JSON response:', resultJson);
    } catch (e) {
      console.log("Google Apps Script response was not JSON, using as text:", responseText);
    }

    // If this was a welcome email, mark it as processed in the cache
    if (isWelcomeEmail && cacheKey) {
      console.log(`Marking welcome email for ${emailData.to} as processed in cache`);
      requestCache.set(cacheKey, {
        timestamp: Date.now(),
        processed: true
      });

      // Clean up old cache entries (older than 5 minutes)
      const now = Date.now();
      for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > 5 * 60 * 1000) {
          requestCache.delete(key);
        }
      }
    }

    // Return the result
    return new Response(JSON.stringify({
      success: true,
      message: 'Email request processed by Edge Function.',
      isWelcomeEmail: isWelcomeEmail,
      googleScriptResponse: resultJson || responseText
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    // Handle any errors
    console.error('Error in send-email function:', error.message, error.stack);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred in Edge Function'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
