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

serve(async (req) => {
  try {
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: corsHeaders
      });
    }

    // Hardcoded Google Apps Script URL - correct deployment
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycby-olZjjoZ5b7RBnQ26doKigaUWoXRxff-fl2y9c6yCScLeldOclwmfiraIPoP1lRlH/exec';
    
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

    // Try to parse the body as JSON if it's a string that looks like JSON
    let parsedBody = emailData.body;
    try {
      if (typeof emailData.body === 'string' && 
          (emailData.body.startsWith('{') || emailData.body.startsWith('['))) {
        parsedBody = JSON.parse(emailData.body);
      }
    } catch (e) {
      console.log('Body is not valid JSON, using as is:', emailData.body);
    }

    // Prepare the payload for Google Apps Script
    const googleScriptPayload = {
      // If we successfully parsed JSON from the body, spread it into the payload
      ...(typeof parsedBody === 'object' ? parsedBody : {}),
      
      // Always include these fields
      customerEmail: emailData.to,
      adminEmail: ADMIN_EMAIL, // Always include admin email
      to: emailData.to,
      subject: emailData.subject,
      
      // Only include body if we didn't parse it as JSON
      ...(typeof parsedBody !== 'object' ? { body: emailData.body } : {}),
      
      // Optional fields
      from: emailData.from,
      replyTo: emailData.replyTo || emailData.from,
      
      // Include timestamp for debugging
      timestamp: new Date().toISOString()
    };

    console.log(`Sending email to ${emailData.to} via Google Apps Script`);
    console.log('Payload:', JSON.stringify(googleScriptPayload));
    
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

    // Return the result
    return new Response(JSON.stringify({
      success: true,
      message: 'Email request processed by Edge Function.',
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
