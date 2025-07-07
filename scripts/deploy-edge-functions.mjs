#!/usr/bin/env node

/**
 * This script helps deploy Supabase Edge Functions
 * It provides a guided process for deploying Edge Functions
 * even if the Supabase CLI is not installed
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Function to print colored text
const print = (text, color = 'reset') => {
  console.log(colors[color] + text + colors.reset);
};

// Function to check if Supabase CLI is installed
const checkSupabaseCLI = () => {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Function to get Supabase project reference
const getProjectRef = async () => {
  return new Promise((resolve) => {
    rl.question('Enter your Supabase project reference (found in the URL of your Supabase dashboard): ', (answer) => {
      resolve(answer.trim());
    });
  });
};

// Function to deploy Edge Function using CLI
const deployWithCLI = async (functionName, projectRef) => {
  try {
    print(`Deploying ${functionName} to Supabase...`, 'cyan');
    execSync(`supabase functions deploy ${functionName} --project-ref ${projectRef}`, { stdio: 'inherit' });
    print(`✅ Successfully deployed ${functionName}!`, 'green');
    return true;
  } catch (error) {
    print(`❌ Failed to deploy ${functionName}: ${error.message}`, 'red');
    return false;
  }
};

// Function to provide manual deployment instructions
const manualDeploymentInstructions = (functionName) => {
  const functionPath = path.join(process.cwd(), 'supabase', 'functions', functionName, 'index.ts');
  
  if (!fs.existsSync(functionPath)) {
    print(`❌ Function file not found: ${functionPath}`, 'red');
    return;
  }
  
  const functionCode = fs.readFileSync(functionPath, 'utf8');
  
  print('\n=== Manual Deployment Instructions ===', 'yellow');
  print('Since the Supabase CLI is not installed or not working, follow these steps to deploy manually:', 'yellow');
  print('1. Log in to your Supabase dashboard: https://app.supabase.com/', 'yellow');
  print('2. Select your project', 'yellow');
  print('3. Navigate to "Edge Functions" in the left sidebar', 'yellow');
  print('4. Click "Create a new function"', 'yellow');
  print(`5. Name it "${functionName}"`, 'yellow');
  print('6. Click "Create function"', 'yellow');
  print('7. Copy the following code and paste it into the editor:', 'yellow');
  print('\n' + '-'.repeat(80) + '\n', 'cyan');
  print(functionCode, 'reset');
  print('\n' + '-'.repeat(80) + '\n', 'cyan');
  print('8. Click "Deploy"', 'yellow');
  print('\n=== End of Manual Deployment Instructions ===\n', 'yellow');
};

// Main function
const main = async () => {
  print('\n🚀 Supabase Edge Functions Deployment Helper\n', 'magenta');
  
  // Check if Supabase CLI is installed
  const cliInstalled = checkSupabaseCLI();
  
  if (!cliInstalled) {
    print('⚠️  Supabase CLI not found. You have two options:', 'yellow');
    print('1. Install the Supabase CLI (recommended)', 'yellow');
    print('2. Deploy manually through the Supabase dashboard', 'yellow');
    
    const answer = await new Promise((resolve) => {
      rl.question('Choose an option (1 or 2): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (answer === '1') {
      print('\nInstalling Supabase CLI...', 'cyan');
      print('Please follow the installation instructions at: https://supabase.com/docs/guides/cli', 'cyan');
      print('After installation, run this script again.', 'cyan');
      rl.close();
      return;
    }
  }
  
  // Get the list of Edge Functions
  const functionsDir = path.join(process.cwd(), 'supabase', 'functions');
  if (!fs.existsSync(functionsDir)) {
    print(`❌ Edge Functions directory not found: ${functionsDir}`, 'red');
    rl.close();
    return;
  }
  
  const functions = fs.readdirSync(functionsDir).filter(
    (dir) => fs.statSync(path.join(functionsDir, dir)).isDirectory()
  );
  
  if (functions.length === 0) {
    print('❌ No Edge Functions found in the supabase/functions directory.', 'red');
    rl.close();
    return;
  }
  
  print(`Found ${functions.length} Edge Function(s): ${functions.join(', ')}`, 'green');
  
  if (cliInstalled) {
    // Deploy using CLI
    const projectRef = await getProjectRef();
    
    for (const functionName of functions) {
      const success = await deployWithCLI(functionName, projectRef);
      if (!success) {
        print(`\nFalling back to manual deployment for ${functionName}...`, 'yellow');
        manualDeploymentInstructions(functionName);
      }
    }
  } else {
    // Provide manual deployment instructions
    for (const functionName of functions) {
      manualDeploymentInstructions(functionName);
    }
  }
  
  print('\n🎉 Deployment process completed!', 'magenta');
  print('Remember to test your Edge Functions to ensure they are working correctly.', 'cyan');
  print('For more information, see the EDGE_FUNCTIONS_GUIDE.md file.', 'cyan');
  
  rl.close();
};

// Run the main function
main().catch((error) => {
  print(`❌ An error occurred: ${error.message}`, 'red');
  rl.close();
});
