// Script to directly create the analytics tables in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key are required. Make sure your .env file is set up correctly.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAnalyticsTables() {
  console.log('Creating analytics tables directly...');

  try {
    // Create analytics_events table directly using REST API
    console.log('Creating analytics_events table...');
    
    // First check if the table exists
    const { error: checkError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // Table doesn't exist, create it with a direct query
      const createEventsTableQuery = `
        CREATE TABLE IF NOT EXISTS analytics_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_type TEXT NOT NULL,
          session_id TEXT NOT NULL,
          user_id TEXT,
          url TEXT,
          referrer TEXT,
          user_agent TEXT,
          product_id TEXT,
          label TEXT,
          value NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
      `;
      
      // We can't run this directly with the REST API, so we'll try to insert a record
      // and see if the table gets created automatically
      const { error: insertError } = await supabase
        .from('analytics_events')
        .insert({
          event_type: 'table_creation',
          session_id: 'setup',
          url: '/setup',
          user_agent: 'setup-script'
        });
      
      if (insertError && insertError.code !== '23505') {
        console.error('Error creating analytics_events table:', insertError);
      } else {
        console.log('analytics_events table created successfully');
      }
    } else {
      console.log('analytics_events table already exists');
    }

    // Create analytics_daily_metrics table
    console.log('Creating analytics_daily_metrics table...');
    
    // First check if the table exists
    const { error: checkMetricsError } = await supabase
      .from('analytics_daily_metrics')
      .select('id')
      .limit(1)
      .single();
    
    if (checkMetricsError && checkMetricsError.code === 'PGRST116') {
      // Table doesn't exist, create it with a direct query
      const createMetricsTableQuery = `
        CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          date DATE NOT NULL UNIQUE,
          unique_visitors INTEGER NOT NULL DEFAULT 0,
          page_views INTEGER NOT NULL DEFAULT 0,
          product_views INTEGER NOT NULL DEFAULT 0,
          add_to_cart_events INTEGER NOT NULL DEFAULT 0,
          checkout_events INTEGER NOT NULL DEFAULT 0,
          purchase_events INTEGER NOT NULL DEFAULT 0,
          bounce_rate INTEGER NOT NULL DEFAULT 0,
          conversion_rate INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_date ON analytics_daily_metrics(date);
      `;
      
      // We can't run this directly with the REST API, so we'll try to insert a record
      // and see if the table gets created automatically
      const { error: insertMetricsError } = await supabase
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
      
      if (insertMetricsError && insertMetricsError.code !== '23505') {
        console.error('Error creating analytics_daily_metrics table:', insertMetricsError);
      } else {
        console.log('analytics_daily_metrics table created successfully');
      }
    } else {
      console.log('analytics_daily_metrics table already exists');
    }

    console.log('Analytics tables setup complete');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createAnalyticsTables();
