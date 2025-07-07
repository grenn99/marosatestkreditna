import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service key in environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addShippingCostColumn() {
  try {
    console.log('Adding shipping_cost column to orders table...');

    // Execute the SQL query to add the column
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Add shipping_cost column to orders table
        ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0.00;

        -- Update existing orders to have a shipping_cost of 0
        UPDATE public.orders SET shipping_cost = 0.00 WHERE shipping_cost IS NULL;

        -- Add comment to the column
        COMMENT ON COLUMN public.orders.shipping_cost IS 'The shipping cost for the order';
      `
    });

    if (error) {
      throw error;
    }

    console.log('Successfully added shipping_cost column to orders table');
    console.log('Data:', data);

  } catch (error) {
    console.error('Error adding shipping_cost column:', error);
  }
}

// Run the function
addShippingCostColumn();
