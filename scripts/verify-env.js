#!/usr/bin/env node

/**
 * This script verifies that environment variables are correctly configured
 * before deployment to prevent security issues.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envProductionPath = path.resolve(process.cwd(), '.env.production');

// Load environment variables
const env = {
  ...dotenv.parse(fs.existsSync(envPath) ? fs.readFileSync(envPath) : ''),
  ...dotenv.parse(fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath) : ''),
  ...dotenv.parse(fs.existsSync(envProductionPath) ? fs.readFileSync(envProductionPath) : ''),
  ...process.env
};

// Define sensitive variables that should NOT have VITE_ prefix
const sensitiveVars = [
  'SUPABASE_SERVICE_KEY',
  'STRIPE_SECRET_KEY',
  'DATABASE_URL',
  'JWT_SECRET'
];

// Define client-safe variables that SHOULD have VITE_ prefix
const clientSafeVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY'
];

// Check for sensitive variables with VITE_ prefix
const sensitiveWithVitePrefix = sensitiveVars
  .map(name => `VITE_${name.replace(/^VITE_/, '')}`)
  .filter(name => env[name]);

// Check for client-safe variables without VITE_ prefix
const clientSafeWithoutVitePrefix = clientSafeVars
  .map(name => name.replace(/^VITE_/, ''))
  .filter(name => env[name]);

// Check for sensitive patterns in VITE_ variables
const sensitivePatterns = [
  { pattern: /^(sk|pk)_(test|live)_[A-Za-z0-9]+$/, name: 'API key' },
  { pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, name: 'JWT token' },
  { pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@.+/, name: 'Database connection string' }
];

const viteVarsWithSensitivePatterns = Object.keys(env)
  .filter(key => key.startsWith('VITE_'))
  .filter(key => {
    const value = env[key];
    return sensitivePatterns.some(({ pattern }) => pattern.test(value));
  });

// Print results
console.log('\n🔒 Environment Variable Security Check\n');

if (sensitiveWithVitePrefix.length > 0) {
  console.error('❌ ERROR: The following sensitive variables have VITE_ prefix and will be exposed in the frontend:');
  sensitiveWithVitePrefix.forEach(name => console.error(`   - ${name}`));
  console.error('\n   These variables should NOT have VITE_ prefix. Please rename them in your .env files.\n');
} else {
  console.log('✅ No sensitive variables with VITE_ prefix found.');
}

if (clientSafeWithoutVitePrefix.length > 0) {
  console.warn('⚠️  WARNING: The following client-safe variables are missing VITE_ prefix:');
  clientSafeWithoutVitePrefix.forEach(name => console.warn(`   - ${name} (should be VITE_${name})`));
  console.warn('\n   These variables should have VITE_ prefix to be available in the frontend.\n');
} else {
  console.log('✅ All client-safe variables have VITE_ prefix.');
}

if (viteVarsWithSensitivePatterns.length > 0) {
  console.error('❌ ERROR: The following VITE_ variables contain sensitive data patterns:');
  viteVarsWithSensitivePatterns.forEach(name => {
    const matchingPattern = sensitivePatterns.find(({ pattern }) => pattern.test(env[name]));
    console.error(`   - ${name} (appears to contain a ${matchingPattern.name})`);
  });
  console.error('\n   These variables will be exposed in the frontend. Please remove the VITE_ prefix.\n');
} else {
  console.log('✅ No VITE_ variables with sensitive data patterns found.');
}

// Check if all required variables are present
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY'
];

const missingRequiredVars = requiredVars.filter(name => !env[name]);

if (missingRequiredVars.length > 0) {
  console.warn('⚠️  WARNING: The following required variables are missing:');
  missingRequiredVars.forEach(name => console.warn(`   - ${name}`));
  console.warn('\n   These variables are required for the application to function correctly.\n');
} else {
  console.log('✅ All required variables are present.');
}

// Final verdict
if (sensitiveWithVitePrefix.length > 0 || viteVarsWithSensitivePatterns.length > 0) {
  console.error('\n❌ SECURITY ISSUES FOUND: Please fix the issues above before deploying.\n');
  process.exit(1);
} else if (clientSafeWithoutVitePrefix.length > 0 || missingRequiredVars.length > 0) {
  console.warn('\n⚠️  WARNINGS FOUND: The application may not function correctly. Please review the warnings above.\n');
  process.exit(0);
} else {
  console.log('\n✅ All environment variables are correctly configured.\n');
  process.exit(0);
}
