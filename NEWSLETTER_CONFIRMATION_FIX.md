# Newsletter Confirmation Flow Fix

This document explains the issues with the newsletter confirmation flow and the changes made to fix them.

## Issues Identified

1. **Incorrect Google Apps Script URL**: The Edge Function was using an outdated Google Apps Script URL.
2. **Discount Code Not Being Passed Correctly**: The discount code was not being properly extracted and passed to the Google Apps Script.
3. **Duplicate Emails**: The system was sending duplicate welcome emails due to ineffective deduplication.
4. **Discount Code Not Being Included in Welcome Emails**: The welcome emails were not including the discount code.

## Changes Made

### 1. Edge Function (`supabase/functions/send-email/index.ts`)

1. **Updated Google Apps Script URL**:
   - Changed from: `'https://script.google.com/macros/s/AKfycbyCujppbtKNLU_1kC7qFBUetKzGu_omPXqPZEExhKOXEpJXjO5uVlxRZ0zcuULgCT_QvA/exec'`
   - To: `'https://script.google.com/macros/s/AKfycbxuj4GKTJNHO1oB1B3UGvdb3Bhg9kJ4ykX-HgDV9nKDLUF3ZEFM-jZZaMzJBOKHHrDL/exec'`

2. **Improved Discount Code Handling**:
   - Enhanced the code to extract discount codes from multiple possible locations (top level, nested in body)
   - Added more detailed logging to track where discount codes are found
   - Explicitly included the discount code at the top level of the payload sent to Google Apps Script

3. **Enhanced Deduplication Logic**:
   - Improved the cache key generation to better catch duplicate welcome emails
   - Removed timestamp from welcome email cache keys to prevent multiple emails to the same recipient
   - Added additional checks for welcome emails in different formats

### 2. Google Apps Script (`email_service_updated.gs`)

1. **Improved Welcome Email Handling**:
   - Enhanced the `handleWelcomeEmail` function to better extract discount codes
   - Added more detailed logging to track the flow of data
   - Included the discount code in the response for debugging purposes

2. **Better Error Handling**:
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
3. Replace the content with the code from `email_service_updated.gs`
4. Save the script
5. Deploy it as a new web app:
   - Click on "Deploy" > "New deployment"
   - Select "Web app" as the deployment type
   - Set "Execute as" to your Google account
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
6. Copy the new deployment URL (it should match the one in the Edge Function)

## Testing the Changes

1. Run the test script to verify the welcome email functionality:

```bash
# Install dependencies
npm install node-fetch

# Run the test script
node test_newsletter_confirmation.js
```

2. Test the full newsletter subscription flow:
   - Subscribe to the newsletter on the website
   - Check for the confirmation email
   - Click the confirmation link
   - Verify that the welcome email with discount code is received

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

4. **Test the Edge Function directly**:
   - Use a tool like Postman to send requests directly to the Edge Function
   - Check the responses for any error messages

## Additional Notes

- The deduplication cache is in-memory and will be reset when the Edge Function is redeployed
- For a more robust solution, consider using a database or KV store for deduplication
- The Google Apps Script has a quota limit of 20,000 emails per day
- Make sure the Google account used for the Google Apps Script has sufficient permissions
