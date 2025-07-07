/**
 * Script to fix the Darilni paket additional image issue
 * 
 * This script ensures that all Darilni paket products have the correct
 * additional image path for "paket 3.jpg"
 */

import { supabase } from '../lib/supabaseClient';

async function fixDarilniPaketAdditionalImage() {
  try {
    console.log('Starting Darilni paket additional image fix...');
    
    // Find all Darilni paket products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', '%Darilni paket%');
    
    if (error) {
      console.error('Error fetching Darilni paket products:', error);
      return;
    }
    
    console.log(`Found ${products.length} Darilni paket products`);
    
    // Update each product
    for (const product of products) {
      console.log(`Processing product ID ${product.id}: ${product.name}`);
      
      // Get current additional images
      let additionalImages = product.additional_images || [];
      
      // Check if the product already has the paket 3.jpg image
      const hasPacket3Image = additionalImages.some(img => 
        img.includes('paket 3.jpg') || img.includes('paket%203.jpg')
      );
      
      if (!hasPacket3Image) {
        console.log(`Adding paket 3.jpg to product ID ${product.id}`);
        
        // Add the image with the correct path
        additionalImages.push('./images/paket 3.jpg');
        
        // Update the product
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            additional_images: additionalImages,
            // Also ensure these are set correctly
            image_url: './images/darilni_paket/gift_package.jpg',
            category: 'gift'
          })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`Error updating product ${product.id}:`, updateError);
        } else {
          console.log(`Successfully updated product ${product.id}`);
        }
      } else {
        console.log(`Product ID ${product.id} already has paket 3.jpg image`);
      }
    }
    
    console.log('Darilni paket additional image fix completed');
  } catch (error) {
    console.error('Error in fixDarilniPaketAdditionalImage:', error);
  }
}

// Execute the function
fixDarilniPaketAdditionalImage();
