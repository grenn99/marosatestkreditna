# Supabase Edge Functions Deployment Guide

This guide provides detailed instructions for deploying the Supabase Edge Functions used in this application.

## Prerequisites

1. **Supabase CLI**: You need to have the Supabase CLI installed.
   ```bash
   # For macOS and Linux using Homebrew
   brew install supabase/tap/supabase

   # For Windows using Scoop
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase

   # Verify installation
   supabase --version
   ```

2. **Supabase Login**: You need to be logged in to your Supabase account.
   ```bash
   supabase login
   ```

## Edge Functions Overview

This application uses the following Edge Functions:

1. **check-admin-role**: Verifies if a user has admin privileges on the server side.

## Deploying Edge Functions

### Option 1: Using Supabase CLI

1. **Navigate to the project root**:
   ```bash
   cd /path/to/your/project
   ```

2. **Deploy the Edge Function**:
   ```bash
   # Replace YOUR_PROJECT_REF with your Supabase project reference
   supabase functions deploy check-admin-role --project-ref YOUR_PROJECT_REF
   ```

   You can find your project reference in the Supabase dashboard URL:
   `https://app.supabase.com/project/YOUR_PROJECT_REF`

3. **Verify deployment**:
   ```bash
   supabase functions list --project-ref YOUR_PROJECT_REF
   ```

### Option 2: Using Supabase Dashboard

If you're having trouble with the CLI, you can deploy Edge Functions through the Supabase dashboard:

1. **Log in to the Supabase dashboard**: https://app.supabase.com/

2. **Select your project**

3. **Navigate to Edge Functions**:
   - Click on "Edge Functions" in the left sidebar

4. **Create a new Edge Function**:
   - Click "Create a new function"
   - Name it "check-admin-role"
   - Click "Create function"

5. **Upload the function code**:
   - Copy the content of `supabase/functions/check-admin-role/index.ts`
   - Paste it into the editor in the Supabase dashboard
   - Click "Deploy"

## Testing Edge Functions

After deployment, you should test the Edge Function to ensure it's working correctly:

1. **Using the Supabase CLI**:
   ```bash
   supabase functions serve check-admin-role --project-ref YOUR_PROJECT_REF
   ```

2. **Using cURL**:
   ```bash
   curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-admin-role' \
     -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
     -H 'Content-Type: application/json'
   ```

## Troubleshooting

If you encounter issues with Edge Functions:

1. **Check logs**:
   ```bash
   supabase functions logs check-admin-role --project-ref YOUR_PROJECT_REF
   ```

2. **Verify environment variables**:
   Make sure the Edge Function has access to the necessary environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

3. **Check CORS settings**:
   If you're getting CORS errors, make sure the Edge Function allows requests from your application domain.

4. **Verify authentication**:
   Make sure you're including the correct Authorization header when calling the Edge Function.

## Updating Edge Functions

If you need to update an Edge Function:

1. **Make changes to the function code**

2. **Redeploy the function**:
   ```bash
   supabase functions deploy check-admin-role --project-ref YOUR_PROJECT_REF
   ```

## Setting Environment Variables for Edge Functions

If your Edge Functions need access to environment variables:

1. **Using the CLI**:
   ```bash
   supabase secrets set MY_VARIABLE=my_value --project-ref YOUR_PROJECT_REF
   ```

2. **Using the dashboard**:
   - Go to the Edge Functions section
   - Click on "Environment variables"
   - Add your variables

## Security Considerations

1. **Never expose sensitive keys** in Edge Functions
2. **Use Row Level Security (RLS)** to protect your data
3. **Validate user input** to prevent injection attacks
4. **Limit function execution time** to prevent abuse

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Runtime Documentation](https://deno.land/manual)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)
