// Script to add product_id column to analytics_events table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key are required. Make sure your .env file is set up correctly.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addProductIdColumn() {
  console.log('Adding product_id column to analytics_events table...');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'src', 'scripts', 'add-product-id-column.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL query using Supabase's rpc function
    const { error } = await supabase.rpc('execute_sql', { sql_query: sqlQuery });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // Alternative approach: try to alter the table directly
      console.log('Trying alternative approach...');
      
      // First check if the analytics_events table exists
      const { error: checkError } = await supabase
        .from('analytics_events')
        .select('id')
        .limit(1);
      
      if (checkError) {
        console.error('Error checking analytics_events table:', checkError);
        return;
      }
      
      // Try to select the product_id column to see if it exists
      const { error: columnCheckError } = await supabase
        .from('analytics_events')
        .select('product_id')
        .limit(1);
      
      if (columnCheckError && columnCheckError.code === '42703') {
        console.log('product_id column does not exist. Creating it manually...');
        
        // We can't directly alter the table with the REST API
        // Let's create a new record with a product_id to force the column creation
        const { error: insertError } = await supabase
          .from('analytics_events')
          .insert({
            event_type: 'column_creation',
            session_id: 'setup',
            product_id: 'setup-product'
          });
        
        if (insertError) {
          console.error('Error creating product_id column:', insertError);
        } else {
          console.log('product_id column created successfully');
        }
      } else {
        console.log('product_id column already exists');
      }
    } else {
      console.log('SQL executed successfully');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
addProductIdColumn();
