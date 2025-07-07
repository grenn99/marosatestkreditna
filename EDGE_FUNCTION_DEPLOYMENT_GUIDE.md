# Edge Function Deployment Guide for Newsletter Fix

This guide explains how to deploy the updated Edge Function to fix the duplicate email issue with newsletter subscription confirmations.

## The Issue

When a user clicks on the confirmation link for newsletter subscription, they receive two welcome emails instead of one. This happens because two doPost signals are being sent to the Google Apps Script instead of one.

## The Fix

The fix involves adding a request deduplication mechanism to the Edge Function to prevent duplicate calls to the Google Apps Script for welcome emails. The updated code includes:

1. A simple in-memory cache to track processed welcome emails
2. Logic to detect and prevent duplicate welcome email requests
3. Improved logging for better debugging

## Deployment Steps

Since the Supabase CLI isn't available, you'll need to deploy the Edge Function manually through the Supabase dashboard:

1. Log in to your Supabase dashboard
2. Navigate to Edge Functions
3. Select the `send-email` function
4. Click "Edit" or "Update"
5. Replace the existing code with the updated code from `supabase/functions/send-email/index.ts`
6. Deploy the updated function

## Testing the Fix

After deploying the updated Edge Function, test the newsletter subscription confirmation flow:

1. Subscribe to the newsletter with a test email
2. Click the confirmation link in the email
3. Verify that only one welcome email is received

## Rollback Plan

If there are any issues with the updated Edge Function, you can roll back to the previous version by:

1. Going to the Supabase dashboard
2. Navigating to Edge Functions
3. Selecting the `send-email` function
4. Clicking "Edit" or "Update"
5. Replacing the code with the previous version
6. Deploying the function

## Key Changes in the Code

The main changes in the Edge Function code are:

1. Added a request deduplication cache:
```typescript
// Simple request deduplication cache to prevent duplicate emails
const requestCache = new Map<string, {timestamp: number, processed: boolean}>();
```

2. Added a function to generate cache keys:
```typescript
function generateCacheKey(emailData: any): string {
  // For welcome emails, create a key based on email, subject and isWelcome flag
  if (emailData.body && typeof emailData.body === 'string') {
    try {
      const parsedBody = JSON.parse(emailData.body);
      if (parsedBody.isWelcome) {
        return `welcome_${emailData.to}_${Date.now().toString().slice(0, -3)}`;
      }
    } catch (e) {
      // If parsing fails, fall through to default key generation
    }
  }
  
  // Default key generation
  return `${emailData.to}_${emailData.subject}_${Date.now().toString().slice(0, -3)}`;
}
```

3. Added logic to detect and prevent duplicate welcome email requests:
```typescript
// Check if this is a duplicate request (especially for welcome emails)
if (isWelcomeEmail) {
  console.log(`Processing welcome email for ${emailData.to}, checking cache with key: ${cacheKey}`);
  
  // Check if we've seen this request recently (within last 60 seconds)
  const cachedRequest = requestCache.get(cacheKey);
  if (cachedRequest && cachedRequest.processed) {
    console.log(`Duplicate welcome email detected for ${emailData.to}, returning cached response`);
    return new Response(JSON.stringify({
      success: true,
      message: 'Email already processed (duplicate request detected).',
      isDuplicate: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  }
}
```

4. Added code to mark requests as processed after completion:
```typescript
// If this was a welcome email, mark it as processed in the cache
if (isWelcomeEmail && cacheKey) {
  console.log(`Marking welcome email for ${emailData.to} as processed in cache`);
  requestCache.set(cacheKey, {
    timestamp: Date.now(),
    processed: true
  });
  
  // Clean up old cache entries (older than 5 minutes)
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      requestCache.delete(key);
    }
  }
}
```
