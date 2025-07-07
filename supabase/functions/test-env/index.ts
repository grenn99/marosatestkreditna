import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get all environment variables (without their values for security)
    const envVars = Object.keys(Deno.env.toObject());
    
    // Check if STRIPE_SECRET_KEY exists
    const hasStripeKey = Deno.env.get('STRIPE_SECRET_KEY') !== undefined;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        envVars,
        hasStripeKey,
        message: 'Environment variables retrieved successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error retrieving environment variables:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
