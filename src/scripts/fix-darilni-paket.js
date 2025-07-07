// Script to fix the Darilni paket product
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDarilniPaket() {
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
      
      // Set the correct image path and category
      const updateData = {
        image_url: './images/darilni_paket/gift_package.jpg',
        category: 'gift',
        // Make sure additional_images includes the selected file
        additional_images: product.additional_images || []
      };
      
      // Add the additional image if it's not already there
      const additionalImagePath = './images/paket 3.jpg';
      if (!updateData.additional_images.includes(additionalImagePath)) {
        updateData.additional_images.push(additionalImagePath);
      }
      
      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        console.log(`Successfully updated product ${product.id} with:`, updateData);
      }
    }
    
    console.log('Update process completed.');
  } catch (error) {
    console.error('Error in fixDarilniPaket:', error);
  }
}

// Execute the function
fixDarilniPaket();
