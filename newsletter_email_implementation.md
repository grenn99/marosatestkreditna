# Newsletter Email Implementation

This document provides instructions for implementing the newsletter subscription confirmation and welcome emails with discount codes.

## Overview

The implementation consists of:

1. A Google Apps Script (`email_service.gs`) that handles different types of emails:
   - Order confirmation emails
   - Newsletter subscription confirmation emails
   - Welcome emails with discount codes

2. An updated Supabase Edge Function (`send-email`) that communicates with the Google Apps Script.

## Deployment Steps

### 1. Deploy the Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the content of `email_service.gs` into the script editor
4. Save the project with a name like "Kmetija Marosa Email Service"
5. Deploy the script as a web app:
   - Click on "Deploy" > "New deployment"
   - Select "Web app" as the deployment type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the deployment URL (it will look like `https://script.google.com/macros/s/AKfycb...`)

### 2. Update the Supabase Edge Function

1. Update the `googleScriptUrl` in the Supabase Edge Function with the new deployment URL:
   - Open `supabase/functions/send-email/index.ts`
   - Replace the existing `googleScriptUrl` with your new deployment URL
   - Or use the provided `updated-index-v3.ts` file as a replacement

2. Deploy the updated Edge Function:
   ```bash
   supabase functions deploy send-email
   ```

## How It Works

### Email Flow

1. When a user subscribes to the newsletter:
   - The frontend calls `subscribeToNewsletter()` in `newsletterService.ts`
   - This creates a pending subscription in the database
   - A confirmation email is sent to the user

2. When a user confirms their subscription:
   - The frontend calls `confirmSubscription()` in `newsletterService.ts`
   - This updates the subscription status to "confirmed"
   - If the subscription came from the welcome popup, a discount code is generated
   - A welcome email is sent with the discount code (if applicable)

### Email Types

The Google Apps Script handles three types of emails:

1. **Order Confirmation Emails**
   - Sent when a user places an order
   - Includes order details, shipping address, and payment information
   - Sends copies to both the customer and admin

2. **Newsletter Confirmation Emails**
   - Sent when a user subscribes to the newsletter
   - Includes a confirmation link to verify the email address
   - Only sent to the subscriber

3. **Welcome Emails with Discount Codes**
   - Sent when a user confirms their newsletter subscription
   - Includes a welcome message and a discount code (if applicable)
   - Only sent to the subscriber

## Testing

To test the implementation:

1. Subscribe to the newsletter using the form on the website
2. Check if you receive a confirmation email
3. Click the confirmation link in the email
4. Check if you receive a welcome email with a discount code
5. Try using the discount code on the checkout page

## Troubleshooting

If emails are not being sent:

1. Check the Google Apps Script logs:
   - Go to your Google Apps Script project
   - Click on "Executions" in the left sidebar
   - Look for any error messages

2. Check the Supabase Edge Function logs:
   - Run `supabase functions logs send-email`
   - Look for any error messages

3. Common issues:
   - Incorrect Google Apps Script URL in the Edge Function
   - Missing permissions in the Google Apps Script
   - Incorrect email format or missing required fields

## Notes

- The discount code is valid for 30 days and can only be used once
- The discount is set to 10% off the total order amount
- The welcome email is only sent after the user confirms their subscription
- The system blocks sending emails to `marosa@noexpire.top` as requested
