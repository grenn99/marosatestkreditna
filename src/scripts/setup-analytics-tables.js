// Script to set up the necessary tables for the analytics system
import { supabase } from '../lib/supabaseClient';

async function setupAnalyticsTables() {
  console.log('Setting up analytics tables...');

  // Check if analytics_events table exists
  const { data: eventsTable, error: eventsError } = await supabase
    .from('analytics_events')
    .select('*')
    .limit(1);

  if (eventsError && eventsError.code === '42P01') {
    // Table doesn't exist, create it
    console.log('Creating analytics_events table...');
    
    const { error: createError } = await supabase.rpc('create_analytics_events_table');
    
    if (createError) {
      console.error('Error creating analytics_events table:', createError);
    } else {
      console.log('analytics_events table created successfully');
    }
  } else {
    console.log('analytics_events table already exists');
  }

  // Check if analytics_daily_metrics table exists
  const { data: metricsTable, error: metricsError } = await supabase
    .from('analytics_daily_metrics')
    .select('*')
    .limit(1);

  if (metricsError && metricsError.code === '42P01') {
    // Table doesn't exist, create it
    console.log('Creating analytics_daily_metrics table...');
    
    const { error: createError } = await supabase.rpc('create_analytics_daily_metrics_table');
    
    if (createError) {
      console.error('Error creating analytics_daily_metrics table:', createError);
    } else {
      console.log('analytics_daily_metrics table created successfully');
    }
  } else {
    console.log('analytics_daily_metrics table already exists');
  }

  console.log('Analytics tables setup complete');
}

// Run the setup function
setupAnalyticsTables().catch(console.error);
