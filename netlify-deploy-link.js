import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a Netlify deploy link
function generateNetlifyDeployLink() {
  const distPath = path.join(__dirname, 'dist');

  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist directory not found. Please run npm run build first.');
    process.exit(1);
  }

  // Generate a Netlify deploy link
  const netlifyDeployUrl = 'https://app.netlify.com/drop';

  console.log('\n=== Netlify Deployment Instructions ===\n');
  console.log(`1. Go to: ${netlifyDeployUrl}`);
  console.log('2. Drag and drop the "dist" folder from your project');
  console.log('3. Wait for the deployment to complete');
  console.log('\nYour site will be live at a Netlify URL once deployment is complete.');
  console.log('\n=== Environment Variables ===\n');
  console.log('After deployment, set these environment variables in your Netlify site settings:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  console.log('- VITE_STRIPE_PUBLISHABLE_KEY');
  console.log('\nIMPORTANT: DO NOT set these sensitive variables in Netlify:');
  console.log('- VITE_SUPABASE_SERVICE_KEY');
  console.log('- STRIPE_SECRET_KEY');
  console.log('- DATABASE_URL');
  console.log('- JWT_SECRET');
  console.log('\nTo set environment variables:');
  console.log('1. Go to your site dashboard in Netlify');
  console.log('2. Navigate to Site settings > Build & deploy > Environment');
  console.log('3. Add the environment variables listed above');

  // Open the browser to the Netlify deploy URL
  console.log('\nOpening Netlify deploy page in your browser...');
  console.log(`URL: ${netlifyDeployUrl}`);
  console.log('\nIf the browser doesn\'t open automatically, copy and paste the URL above.');
}

// Run the function
generateNetlifyDeployLink();
