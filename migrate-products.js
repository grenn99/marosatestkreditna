import { createClient } from '@supabase/supabase-js';
// Import from the compiled JavaScript file in the dist-script directory
import { products as localProducts } from './dist-script/data/products.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or Service Key not found in .env file.');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client with the service key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Required for service key usage, prevents auto-refreshing tokens
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to group products by name and format package options
function groupAndFormatProducts(products) {
  const grouped = products.reduce((acc, product) => {
    if (!acc[product.name]) {
      acc[product.name] = {
        name: product.name,
        description: product.description, // Assuming description is the same for variations
        image_url: product.image, // Assuming image is the same for variations
        category: 'Default', // Add a default category or determine logic later
        price: null, // <--- RENAMED from base_price to match schema
        package_options: [], // Initialize as empty array
        stock_quantity: 100, // Default stock, adjust as needed
      };
    }
    // Add variation details to package_options
    if (product.weight || product.price) {
       acc[product.name].package_options.push({
         weight: product.weight || null, // Use null if weight is not specified
         price: product.price ? parseFloat(product.price.replace(' €', '').replace(',', '.')) : null, // Convert price string to number
       });
    } else {
       // This case might not be hit if all products have price/weight, but good to consider
       // If a product truly has no variations, this logic might need adjustment
       // Let's try setting the main 'price' field if package_options remains empty
       if (acc[product.name].package_options.length === 0) {
         acc[product.name].price = product.price ? parseFloat(product.price.replace(' €', '').replace(',', '.')) : null; // <--- Use 'price' field
       }
    }

    return acc;
  }, {});

  // Post-processing to finalize 'price' vs 'package_options'
  Object.values(grouped).forEach(prod => {
    if (prod.package_options.length === 1 && !prod.package_options[0].weight && prod.package_options[0].price !== null) {
        // If only one "variation" exists and it has no weight, treat it as a single item.
        prod.price = prod.package_options[0].price; // <--- Set main 'price'
        prod.package_options = null; // <--- Clear package options (or set to [])
    } else if (prod.package_options.length === 0 && prod.price === null) {
        // Handle cases where a product might have been added without price/weight initially
        console.warn(`Product "${prod.name}" has no price information.`);
        prod.package_options = null; // Ensure package_options is null if no price and no options
    } else if (prod.package_options.length > 0) {
        // Ensure main 'price' is null if there are package options
        prod.price = null;
    } else if (prod.package_options.length === 0) {
        // If there are no package options ensure it's null or empty array for DB consistency
        prod.package_options = null;
    }
  });


  return Object.values(grouped);
}

async function migrateProducts() {
  console.log('Starting product migration...');

  if (!localProducts || localProducts.length === 0) {
    console.error('Error: No products found after import. Check compilation and import path.');
    process.exit(1);
  }

  const formattedProducts = groupAndFormatProducts(localProducts);

  console.log(`Processed ${formattedProducts.length} unique products for migration.`);
  // console.log('Formatted data:', JSON.stringify(formattedProducts, null, 2)); // Optional: Log data before insertion

  // Clear existing products before inserting new ones (optional, be careful!)
  // console.log('Deleting existing products...');
  // const { error: deleteError } = await supabase.from('products').delete().neq('id', 0); // Delete all rows
  // if (deleteError) {
  //   console.error('Error deleting existing products:', deleteError);
  //   return;
  // }
  // console.log('Existing products deleted.');


  console.log('Inserting products into Supabase...');
  const { data, error } = await supabase
    .from('products')
    .insert(formattedProducts)
    .select(); // Select to see the inserted data

  if (error) {
    console.error('Error inserting products:', error);
    // Log formatted data that caused the error if helpful
    // console.error('Data attempted:', JSON.stringify(formattedProducts, null, 2));
  } else {
    console.log('Successfully migrated products:');
    console.log(JSON.stringify(data, null, 2));
    console.log(`\nSuccessfully inserted ${data?.length ?? 0} products.`);
  }
}

migrateProducts();
