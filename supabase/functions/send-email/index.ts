// Simple Supabase Edge Function to send emails via Google Apps Script
// Uses universal script approach - one script handles all email types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req: Request) => {
  try {
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: corsHeaders
      });
    }

    // Parse the request body first to determine email type
    const emailData = await req.json();

    // Determine email type and route to appropriate script
    let googleScriptUrl: string;
    let emailType = 'unknown';
    let isNewsletterEmail = false;

    // Check if this is a newsletter/welcome email
    try {
      if (typeof emailData.body === 'string') {
        const parsedBody = JSON.parse(emailData.body);
        if (parsedBody.isConfirmation || parsedBody.isWelcome) {
          // Newsletter/welcome emails → kmetija.marosa.novice@gmail.com
          googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyHXEz-OkuzmU1Gth6e9xHiZ4GNDILrWRz_DUqud6VlLNf6AK6YM9zzHlpkD4sfr6tcRQ/exec';
          emailType = parsedBody.isConfirmation ? 'newsletter-confirmation' : 'welcome';
          isNewsletterEmail = true;
          console.log(`📧 NEWSLETTER EMAIL: Using kmetija.marosa.novice@gmail.com for ${emailType}`);
        } else {
          // Order confirmations → kmetija.marosa.narocila@gmail.com
          googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw2pysAAgrqlkDA85BghF4QM9sCbDjFdogrIHRDA3UDpMo-8SsttlsUXMmATz-kRdSDSg/exec';
          emailType = 'order-confirmation';
          console.log(`📦 ORDER EMAIL: Using kmetija.marosa.narocila@gmail.com for ${emailType}`);
        }
      } else {
        // Default to order confirmation for non-JSON body
        googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw2pysAAgrqlkDA85BghF4QM9sCbDjFdogrIHRDA3UDpMo-8SsttlsUXMmATz-kRdSDSg/exec';
        emailType = 'order-confirmation';
        console.log(`📦 ORDER EMAIL: Using kmetija.marosa.narocila@gmail.com for ${emailType} (default)`);
      }
    } catch (e) {
      // If parsing fails, default to order confirmation
      googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw2pysAAgrqlkDA85BghF4QM9sCbDjFdogrIHRDA3UDpMo-8SsttlsUXMmATz-kRdSDSg/exec';
      emailType = 'order-confirmation';
      console.log(`📦 ORDER EMAIL: Using kmetija.marosa.narocila@gmail.com for ${emailType} (parse error fallback)`);
    }

    // Validate required fields
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

    // Determine the correct FROM and REPLY-TO emails based on email type
    const fromEmail = isNewsletterEmail ? 'kmetija.marosa.novice@gmail.com' : 'kmetija.marosa.narocila@gmail.com';
    const replyToEmail = isNewsletterEmail ? 'kmetija.marosa.novice@gmail.com' : 'kmetija.marosa.narocila@gmail.com';

    // Prepare payload for Google Apps Script
    let scriptData: any;

    if (isNewsletterEmail) {
      // Newsletter emails: pass data as-is (simple structure)
      scriptData = {
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        from: emailData.from || fromEmail,
        replyTo: emailData.replyTo || replyToEmail,
      };
    } else {
      // Order emails: parse the body and spread the order data
      try {
        const orderData = JSON.parse(emailData.body);
        scriptData = {
          // Include basic email fields
          to: emailData.to,
          subject: emailData.subject,
          from: emailData.from || fromEmail,
          replyTo: emailData.replyTo || replyToEmail,
          // Spread all order data fields directly
          ...orderData
        };
      } catch (e) {
        // Fallback if parsing fails
        scriptData = {
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          from: emailData.from || fromEmail,
          replyTo: emailData.replyTo || replyToEmail,
        };
      }
    }

    console.log(`📧 SENDING ${emailType.toUpperCase()} EMAIL:`, {
      to: scriptData.to,
      subject: scriptData.subject,
      from: scriptData.from,
      replyTo: scriptData.replyTo,
      scriptUrl: googleScriptUrl.substring(googleScriptUrl.lastIndexOf('/') - 20)
    });

    // Call the Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scriptData)
    });

    const responseText = await response.text();
    console.log('Google Apps Script response:', responseText);

    // Try to parse JSON response
    let resultJson = null;
    try {
      resultJson = JSON.parse(responseText);
    } catch (e) {
      console.log("Response was not JSON:", responseText);
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      googleScriptResponse: resultJson || responseText
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
