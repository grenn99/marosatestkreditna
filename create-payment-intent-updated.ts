import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.4.0?dts';

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
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Create a Stripe instance with the Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('Stripe secret key available:', !!stripeSecretKey);
    
    // Log all available environment variables (without their values for security)
    console.log('Available environment variables:', Object.keys(Deno.env.toObject()));

    if (!stripeSecretKey) {
      console.error('Stripe secret key is missing in environment variables');
      return new Response(
        JSON.stringify({ error: 'Stripe secret key is missing in environment variables' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Parse the request body
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { amount, currency = 'eur', orderId } = requestBody;

    // Validate the amount
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be a positive number' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create a PaymentIntent with the specified amount and currency
    console.log('Creating payment intent with params:', { amount, currency, orderId });
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          orderId: orderId || '',
        },
      });
      
      console.log('Payment intent created successfully:', paymentIntent.id);
      
      // Return the PaymentIntent client_secret
      return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ error: `Stripe API error: ${stripeError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
