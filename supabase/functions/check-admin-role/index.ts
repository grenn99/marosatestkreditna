// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define allowed origins - replace with your actual domains
const ALLOWED_ORIGINS = [
  'https://marosakreditna.netlify.app',
  'https://680ad6594e5703d7515a85fe--marosakreditna.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:3000'
];

/**
 * Get secure CORS headers based on the request origin
 */
function getSecureCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';

  // Only allow specified origins
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin' // Important for caching responses with different origins
  };
}

/**
 * Handle CORS preflight requests
 */
function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: getSecureCorsHeaders(request) });
  }
  return null;
}

// Define admin emails - keep in sync with src/config/adminConfig.ts and the SQL is_admin function
const ADMIN_EMAILS = ['nakupi@si.si'];

// Note: Edge Functions can't import from the frontend codebase,
// so we need to maintain this list separately. Make sure to update
// all three places when adding or removing admin users:
// 1. This Edge Function
// 2. src/config/adminConfig.ts
// 3. The SQL is_admin function

serve(async (req) => {
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) return preflightResponse;

  // Get secure CORS headers for this request
  const headers = {
    ...getSecureCorsHeaders(req),
    'Content-Type': 'application/json',
  };

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the session of the user who called this function
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    // For development purposes, allow access even without a session
    if (!session) {
      console.log('No session found, but allowing access for development');
      return new Response(
        JSON.stringify({
          isAdmin: true,
          user: {
            id: 'dev-user',
            email: 'nakupi@si.si'
          },
          note: 'Development mode - no authentication required'
        }),
        { headers }
      );
    }

    console.log('Checking admin status for user:', session.user.email);

    // Check if the user's email is in the admin list - this matches the SQL is_admin function
    const isAdmin = ADMIN_EMAILS.includes(session.user.email);

    if (isAdmin) {
      console.log('User is admin based on email list');
    } else {
      console.log('User is not an admin');
    }

    // Note: We're using the same approach as the SQL is_admin function
    // to ensure consistency between the Edge Function and the database

    return new Response(
      JSON.stringify({
        isAdmin,
        user: {
          id: session.user.id,
          email: session.user.email
        }
      }),
      { headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ isAdmin: false, error: error.message }),
      { headers, status: 500 }
    );
  }
})
