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

    // Universal Google Apps Script URL - handles ALL email types
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyHXEz-OkuzmU1Gth6e9xHiZ4GNDILrWRz_DUqud6VlLNf6AK6YM9zzHlpkD4sfr6tcRQ/exec';

    // Parse the request body
    const emailData = await req.json();

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

    // Prepare simple payload for Google Apps Script
    const scriptData = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      from: emailData.from || 'kmetija.marosa.novice@gmail.com',
      replyTo: emailData.replyTo || 'kmetija.marosa.novice@gmail.com',
    };

    console.log('Sending email via Google Apps Script:', {
      to: scriptData.to,
      subject: scriptData.subject,
      from: scriptData.from,
      replyTo: scriptData.replyTo
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
