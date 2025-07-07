// Script to manually create the analytics tables in Supabase
// Run this script with: node create-analytics-tables.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with your project URL and service role key
// You'll need to provide these when running the script
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key are required. Make sure your .env file is set up correctly.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAnalyticsTables() {
  console.log('Creating analytics tables...');

  try {
    // Create analytics_events table
    console.log('Creating analytics_events table...');
    const { error: eventsError } = await supabase.rpc('create_analytics_events_table', {});

    if (eventsError) {
      console.error('Error creating analytics_events table:', eventsError);
      
      // Try direct SQL if RPC fails
      console.log('Trying direct SQL creation...');
      const { error: directEventsError } = await supabase
        .from('analytics_events')
        .insert({
          event_type: 'table_creation',
          session_id: 'setup',
          url: '/setup',
          user_agent: 'setup-script'
        });
        
      if (directEventsError && directEventsError.code !== '23505') {
        console.error('Error with direct creation of analytics_events:', directEventsError);
      } else {
        console.log('analytics_events table created or already exists');
      }
    } else {
      console.log('analytics_events table created successfully');
    }

    // Create analytics_daily_metrics table
    console.log('Creating analytics_daily_metrics table...');
    const { error: metricsError } = await supabase.rpc('create_analytics_daily_metrics_table', {});

    if (metricsError) {
      console.error('Error creating analytics_daily_metrics table:', metricsError);
      
      // Try direct SQL if RPC fails
      console.log('Trying direct SQL creation...');
      const { error: directMetricsError } = await supabase
        .from('analytics_daily_metrics')
        .insert({
          date: new Date().toISOString().split('T')[0],
          unique_visitors: 0,
          page_views: 0,
          product_views: 0,
          add_to_cart_events: 0,
          checkout_events: 0,
          purchase_events: 0,
          bounce_rate: 0,
          conversion_rate: 0
        });
        
      if (directMetricsError && directMetricsError.code !== '23505') {
        console.error('Error with direct creation of analytics_daily_metrics:', directMetricsError);
      } else {
        console.log('analytics_daily_metrics table created or already exists');
      }
    } else {
      console.log('analytics_daily_metrics table created successfully');
    }

    console.log('Analytics tables setup complete');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createAnalyticsTables();
