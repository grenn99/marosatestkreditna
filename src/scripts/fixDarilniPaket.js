// Simple script to fix Darilni paket products
import { supabase } from '../lib/supabaseClient';

async function fixDarilniPaketProducts() {
  try {
    console.log('Fixing Darilni paket products...');
    
    // Find all Darilni paket products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', '%Darilni paket%');
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products.length} Darilni paket products`);
    
    // Update each product
    for (const product of products) {
      console.log(`Updating product ${product.id}: ${product.name}`);
      
      // Ensure the product has the correct image and category
      const { error: updateError } = await supabase
        .from('products')
        .update({
          image_url: './images/darilni_paket/gift_package.jpg',
          category: 'gift',
          // Add the paket 3.jpg to additional images if not already there
          additional_images: [...new Set([
            ...(product.additional_images || []),
            './images/paket 3.jpg'
          ])]
        })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
      } else {
        console.log(`Successfully updated product ${product.id}`);
      }
    }
    
    console.log('Darilni paket products fixed successfully');
  } catch (error) {
    console.error('Error fixing Darilni paket products:', error);
  }
}

// Run the function
fixDarilniPaketProducts();
