# Deployment Guide for Security Improvements

This guide outlines the steps needed to deploy the security improvements we've made to the application.

## 1. Deploy the Supabase Edge Function

The `check-admin-role` Edge Function needs to be deployed to Supabase to enable server-side admin role checking.

### Using the Deployment Helper Script

We've created a helper script to simplify the Edge Functions deployment process:

```bash
# Run the Edge Functions deployment helper
npm run deploy:edge-functions
```

This script will:
- Check if the Supabase CLI is installed
- Guide you through the deployment process
- Provide manual deployment instructions if needed

### Alternative: Manual Deployment

If you prefer to deploy manually:

1. **Install the Supabase CLI**:
   ```bash
   # For macOS and Linux using Homebrew
   brew install supabase/tap/supabase

   # For Windows using Scoop
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Deploy the Edge Function**:
   ```bash
   # Navigate to the project root
   cd /path/to/your/project

   # Deploy the Edge Function
   supabase functions deploy check-admin-role --project-ref YOUR_PROJECT_REF
   ```

### Detailed Edge Functions Guide

For more detailed instructions, troubleshooting, and advanced configuration, see the [Edge Functions Guide](EDGE_FUNCTIONS_GUIDE.md).

## 2. Update Netlify Environment Variables

Update your Netlify environment variables to match the new structure:

1. Log in to your Netlify dashboard
2. Go to your site's settings
3. Navigate to the "Environment variables" section
4. Make sure only client-safe variables (with `VITE_` prefix) are set in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
5. Remove any sensitive variables that might have the `VITE_` prefix:
   - Remove `VITE_SUPABASE_SERVICE_KEY` if it exists
   - Remove any other sensitive variables with `VITE_` prefix

## 3. Rotate All Secrets

For maximum security, rotate all your secrets:

### Supabase Service Key

1. Log in to your Supabase dashboard
2. Go to Project Settings > API
3. Click "Regenerate" next to the service key
4. Update the `SUPABASE_SERVICE_KEY` in your local `.env.local` file
5. Update the key in any CI/CD systems or server environments

### Stripe Secret Key

1. Log in to your Stripe dashboard
2. Go to Developers > API keys
3. Click "Create restricted key" or rotate your existing key
4. Update the `STRIPE_SECRET_KEY` in your local `.env.local` file
5. Update the key in any CI/CD systems or server environments

### Database Password

1. Log in to your Supabase dashboard
2. Go to Project Settings > Database
3. Update the database password
4. Update the `DATABASE_URL` in your local `.env.local` file
5. Update the connection string in any CI/CD systems or server environments

### JWT Secret

1. Generate a new JWT secret:
   ```bash
   openssl rand -base64 64
   ```
2. Update the `JWT_SECRET` in your local `.env.local` file
3. Update the secret in any CI/CD systems or server environments

## 4. Deploy to Netlify

Deploy your application to Netlify:

```bash
# Build the application
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 5. Test in Production

After deployment, test all functionality in the production environment:

1. Test user authentication (login, signup, password change)
2. Test admin access and functionality
3. Test encrypted data (shipping addresses, etc.)
4. Test checkout process
5. Verify that the Content Security Policy is working

## 6. Security Maintenance

To maintain the security of your application over time:

1. Regularly update dependencies
2. Conduct periodic security audits
3. Monitor for suspicious activity
4. Keep secrets rotated on a regular schedule
5. Stay informed about security best practices

## Troubleshooting

If you encounter issues with the server-side admin role checking:

1. Check the Supabase Edge Function logs in the Supabase dashboard
2. Verify that the Edge Function is deployed correctly
3. Check that the client is correctly calling the Edge Function
4. The application will fall back to client-side admin checking if needed

If you encounter issues with the Content Security Policy:

1. Check the browser console for CSP violation errors
2. Adjust the CSP in the `public/_headers` file as needed
3. Redeploy the application
