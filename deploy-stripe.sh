#!/bin/bash

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Create the function directory structure
mkdir -p "$TEMP_DIR/supabase/functions/create-payment-intent"
echo "Created function directory structure"

# Create the function file
cat > "$TEMP_DIR/supabase/functions/create-payment-intent/index.ts" << 'EOF'
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

    if (!stripeSecretKey) {
      console.error('Stripe secret key is missing in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
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
    const { amount, currency = 'eur', orderId } = await req.json();

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
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        orderId: orderId || '',
      },
    });

    // Return the PaymentIntent client_secret
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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
EOF
echo "Created function file"

# Change to the temporary directory
cd "$TEMP_DIR"
echo "Changed to temporary directory"

# Deploy the function
echo "Deploying function..."
ORIG_DIR=$(pwd)
cd -
NODE_MODULES_PATH=$(pwd)/node_modules
cd "$ORIG_DIR"
$NODE_MODULES_PATH/supabase/bin/supabase functions deploy create-payment-intent

# Clean up
echo "Cleaning up..."
cd -
rm -rf "$TEMP_DIR"
echo "Done!"
