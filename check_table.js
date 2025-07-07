// Simple script to check the table structure
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  try {
    // Try to get the table structure
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching table:', error);
      return;
    }

    // If we got data, show the column names
    if (data && data.length > 0) {
      console.log('Table columns:', Object.keys(data[0]));
    } else {
      console.log('Table exists but is empty');

      // Try to get the table definition
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_definition', { table_name: 'newsletter_subscribers' });

      if (tableError) {
        console.error('Error getting table definition:', tableError);
      } else {
        console.log('Table definition:', tableInfo);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkTable();
