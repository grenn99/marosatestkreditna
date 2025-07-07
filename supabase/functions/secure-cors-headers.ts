// Secure CORS headers for Supabase Edge Functions
// This file should be imported by all edge functions to ensure consistent security

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
 * @param request The incoming request
 * @returns CORS headers object
 */
export function getSecureCorsHeaders(request: Request): Record<string, string> {
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
 * @param request The incoming request
 * @returns Response for preflight requests or null if not a preflight request
 */
export function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: getSecureCorsHeaders(request) });
  }
  return null;
}
