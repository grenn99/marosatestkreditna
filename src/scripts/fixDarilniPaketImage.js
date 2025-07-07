// Script to fix the image URL for the "Darilni paket" product
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDarilniPaketImage() {
  try {
    console.log('Searching for "Darilni paket" product...');
    
    // Find the product
    const { data: products, error: findError } = await supabase
      .from('products')
      .select('*')
      .ilike('name', '%Darilni paket%');
    
    if (findError) {
      throw findError;
    }
    
    if (!products || products.length === 0) {
      console.log('No "Darilni paket" product found.');
      return;
    }
    
    console.log(`Found ${products.length} matching products:`, products);
    
    // Update each matching product
    for (const product of products) {
      console.log(`Updating product ID ${product.id}...`);
      
      // Set the correct image path
      const correctImagePath = `/images/darilni_paket/gift_package.jpg`;
      
      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          image_url: correctImagePath,
          // Also ensure the category is set to link it to gifts
          category: 'gift'
        })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        console.log(`Successfully updated product ${product.id} with image path: ${correctImagePath}`);
      }
    }
    
    console.log('Update process completed.');
  } catch (error) {
    console.error('Error in fixDarilniPaketImage:', error);
  }
}

// Execute the function
fixDarilniPaketImage();
