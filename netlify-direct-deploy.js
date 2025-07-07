import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createReadStream } from 'fs';
import { createGzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const streamPipeline = promisify(pipeline);

// Function to create a zip file of the dist directory
async function createDistZip() {
  const distPath = path.join(__dirname, 'dist');
  const zipPath = path.join(__dirname, 'dist.zip');

  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist directory not found. Please run npm run build first.');
    process.exit(1);
  }

  console.log('Creating zip file of dist directory...');

  try {
    // Create a zip file using the zip command
    execSync(`cd ${distPath} && zip -r ${zipPath} .`, { stdio: 'inherit' });
    console.log('Zip file created successfully.');
    return zipPath;
  } catch (error) {
    console.error('Error creating zip file:', error);
    process.exit(1);
  }
}

// Function to deploy to Netlify
async function deployToNetlify() {
  console.log('Starting direct deployment to Netlify...');

  // Ask for Netlify personal access token
  const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

  if (!netlifyToken) {
    console.error('Error: NETLIFY_AUTH_TOKEN environment variable is required.');
    console.error('Please set it with: export NETLIFY_AUTH_TOKEN=your_token');
    console.error('You can create a personal access token at: https://app.netlify.com/user/applications#personal-access-tokens');
    process.exit(1);
  }

  try {
    // Create a zip file of the dist directory
    const zipPath = await createDistZip();

    // Create a new site on Netlify
    console.log('Creating a new site on Netlify...');

    const createSiteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'kmetija-marosa',
        custom_domain: null,
        force_ssl: true
      })
    });

    if (!createSiteResponse.ok) {
      throw new Error(`Failed to create site: ${createSiteResponse.statusText}`);
    }

    const siteData = await createSiteResponse.json();
    console.log(`Site created: ${siteData.name} (${siteData.url})`);

    // Deploy the site
    console.log('Deploying site...');

    const form = new FormData();
    form.append('file', fs.createReadStream(zipPath));
    form.append('function_paths', '[]');

    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteData.site_id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`
      },
      body: form
    });

    if (!deployResponse.ok) {
      throw new Error(`Failed to deploy site: ${deployResponse.statusText}`);
    }

    const deployData = await deployResponse.json();
    console.log(`Deployment successful!`);
    console.log(`Site URL: ${deployData.deploy_url || siteData.url}`);

    // Set environment variables (only client-safe ones)
    console.log('Setting client-safe environment variables...');

    const envVars = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY
    };

    // Enhanced security check: ensure we're not accidentally setting sensitive variables
    const sensitiveKeys = [
      'SUPABASE_SERVICE_KEY',
      'VITE_SUPABASE_SERVICE_KEY', // Check both formats for safety
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_SECRET_KEY', // Check both formats for safety
      'DATABASE_URL',
      'VITE_DATABASE_URL', // Check both formats for safety
      'JWT_SECRET',
      'VITE_JWT_SECRET' // Check both formats for safety
    ];

    // Check for any environment variables that might contain sensitive data
    const dangerousPatterns = [
      { pattern: /^(sk|pk)_(test|live)_[A-Za-z0-9]+$/, name: 'API key' },
      { pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, name: 'JWT token' },
      { pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@.+/, name: 'Database connection string' }
    ];

    // First check known sensitive keys
    let hasSensitiveKeys = false;
    sensitiveKeys.forEach(key => {
      if (process.env[key]) {
        console.error(`ERROR: Sensitive key ${key} is present in environment and should NOT be deployed to Netlify.`);
        hasSensitiveKeys = true;
      }
    });

    // Then check all VITE_ prefixed variables for dangerous patterns
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        const value = process.env[key];
        dangerousPatterns.forEach(({ pattern, name }) => {
          if (pattern.test(value)) {
            console.error(`ERROR: Environment variable ${key} appears to contain a ${name}, which is sensitive data that should NOT be exposed in the frontend.`);
            hasSensitiveKeys = true;
          }
        });
      }
    });

    // Abort deployment if sensitive keys are found
    if (hasSensitiveKeys) {
      console.error('\nDeployment aborted due to security concerns.');
      console.error('Please remove sensitive data from environment variables before deploying.');
      console.error('Remember: Variables prefixed with VITE_ will be exposed in the frontend code.');
      process.exit(1);
    }

    console.log('Security check passed. No sensitive keys detected in client-side environment variables.');

    const envResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteData.site_id}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envVars)
    });

    if (!envResponse.ok) {
      console.warn(`Warning: Failed to set environment variables: ${envResponse.statusText}`);
      console.warn('You will need to set them manually in the Netlify dashboard.');
    } else {
      console.log('Environment variables set successfully.');
    }

    // Clean up
    fs.unlinkSync(zipPath);

    console.log('\n=== Deployment Complete ===');
    console.log(`Your site is now live at: ${siteData.url}`);
    console.log(`Admin URL: https://app.netlify.com/sites/${siteData.name}/overview`);

    return siteData.url;
  } catch (error) {
    console.error('Error deploying to Netlify:', error);
    process.exit(1);
  }
}

// Run the deployment
deployToNetlify();
