# Email System Fix Documentation

This document explains the issues with the email system and the changes made to fix them.

## Issues Identified

1. **Newsletter Confirmation Flow**:
   - The welcome email with discount code was not being sent after the user clicked the confirmation link.
   - The discount code was not being properly passed to the Google Apps Script.

2. **Order Confirmation Emails**:
   - After fixing the newsletter subscription flow, the order confirmation emails stopped working properly.
   - Previously, one doPost signal would send emails to both the customer and admin.

## Changes Made

### 1. Edge Function (`supabase/functions/send-email/index.ts`)

1. **Updated Google Apps Script URL**:
   - Changed to the latest deployment URL: `'https://script.google.com/macros/s/AKfycbxE10OFGBoSVGRFBk304KTgu1txHxFXIq97mE4xN05wQnQf2v_815uKT_LoXZYOebXqZg/exec'`

2. **Improved Discount Code Handling**:
   - Enhanced the code to extract discount codes from multiple possible locations (top level, nested in body)
   - Added more detailed logging to track where discount codes are found
   - Explicitly included the discount code at the top level of the payload sent to Google Apps Script

3. **Enhanced Deduplication Logic**:
   - Improved the cache key generation to better catch duplicate welcome emails
   - Removed timestamp from welcome email cache keys to prevent multiple emails to the same recipient
   - Added additional checks for welcome emails in different formats

### 2. Google Apps Script (`email_service_combined.gs`)

1. **Combined Multiple Email Types**:
   - Created a unified script that handles all three types of emails:
     - Newsletter confirmation emails
     - Welcome emails with discount codes
     - Order confirmation emails (to both customer and admin)

2. **Improved Welcome Email Handling**:
   - Enhanced the `handleWelcomeEmail` function to better extract discount codes
   - Added more detailed logging to track the flow of data
   - Included the discount code in the response for debugging purposes

3. **Preserved Order Confirmation Logic**:
   - Maintained the original order confirmation email logic that sends emails to both customer and admin
   - Ensured that a single doPost request for an order confirmation sends both emails

4. **Better Error Handling**:
   - Added more robust error handling throughout the script
   - Improved logging to make debugging easier

## How to Deploy the Changes

### 1. Deploy the Updated Edge Function

1. Navigate to the Supabase project dashboard
2. Go to Edge Functions
3. Select the `send-email` function
4. Deploy the updated code from `supabase/functions/send-email/index.ts`

```bash
# From the project root
supabase functions deploy send-email
```

### 2. Deploy the Updated Google Apps Script

1. Open the Google Apps Script editor (https://script.google.com)
2. Create a new script or open the existing one
3. Replace the content with the code from `email_service_combined.gs`
4. Save the script
5. Deploy it as a new web app:
   - Click on "Deploy" > "New deployment"
   - Select "Web app" as the deployment type
   - Set "Execute as" to your Google account
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
6. Copy the new deployment URL and make sure it matches the one in the Edge Function

## Testing the Changes

### 1. Test Newsletter Subscription Flow

1. Subscribe to the newsletter on the website
2. Check for the confirmation email
3. Click the confirmation link
4. Verify that the welcome email with discount code is received

### 2. Test Order Confirmation Flow

1. Place an order on the website
2. Complete the checkout process
3. Verify that both the customer and admin receive order confirmation emails

## Troubleshooting

If issues persist:

1. **Check the Edge Function logs**:
   - Go to the Supabase dashboard
   - Navigate to Edge Functions > send-email > Logs
   - Look for any errors or warnings

2. **Check the Google Apps Script logs**:
   - Open the Google Apps Script editor
   - Click on "View" > "Logs"
   - Look for any errors or warnings

3. **Verify the Google Apps Script URL**:
   - Make sure the URL in the Edge Function matches the deployed Google Apps Script

## How the System Works

### Newsletter Subscription Flow

1. User submits email to subscribe
2. Initial confirmation email is sent with a confirmation link
3. User clicks the confirmation link which leads to `/confirm-subscription` page
4. The page calls `confirmSubscription()` in `newsletterService.ts`
5. This function updates the subscriber status to "confirmed" in the database
6. It then generates a discount code (if applicable) and sends a welcome email with the discount code

### Order Confirmation Flow

1. User completes checkout
2. The system calls the Edge Function with order details
3. The Edge Function forwards the request to the Google Apps Script
4. The Google Apps Script sends two emails:
   - One to the customer with order details
   - One to the admin with the same order details

## Additional Notes

- The deduplication cache is in-memory and will be reset when the Edge Function is redeployed
- For a more robust solution, consider using a database or KV store for deduplication
- The Google Apps Script has a quota limit of 20,000 emails per day
- Make sure the Google account used for the Google Apps Script has sufficient permissions
