# Edge Function Deployment Guide for Discount Code Fix

This guide explains how to deploy the updated Edge Function to fix the issue with discount codes not appearing in welcome emails.

## The Issue

When a user confirms their newsletter subscription, they receive a welcome email, but the discount code is not included in the email. This happens because the discount code is not being properly passed from the frontend to the Google Apps Script.

## The Fix

The fix involves explicitly including the discount code at the top level of the email payload in both the frontend and the Edge Function. The updated code:

1. Explicitly includes the discount code in the email payload in the `sendWelcomeEmail` function
2. Extracts the discount code in the Edge Function and includes it at the top level of the Google Apps Script payload

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
3. Verify that the welcome email includes the discount code

## Key Changes in the Code

1. In `src/utils/newsletterService.ts`:
```typescript
// Send the email with discount code explicitly included at top level
const emailResult = await sendEmail({
  to: email,
  subject,
  body: JSON.stringify({
    html: htmlContent,
    text: textContent,
    isWelcome: true,
    discountCode: discountCode || undefined // Explicitly include discount code
  }),
  from: DEFAULT_FROM_EMAIL,
  replyTo: REPLY_TO_EMAIL
});
```

2. In `supabase/functions/send-email/index.ts`:
```typescript
// For welcome emails, ensure discount code is included at the top level
const isWelcomeEmail = parsedBody.isWelcome === true;
const discountCode = isWelcomeEmail && parsedBody.discountCode ? parsedBody.discountCode : undefined;

if (isWelcomeEmail && discountCode) {
  console.log(`Including discount code in welcome email: ${discountCode}`);
}

googleScriptPayload = {
  ...commonEmailProperties,
  isConfirmation: parsedBody.isConfirmation || false,
  isWelcome: parsedBody.isWelcome || false,
  discountCode: discountCode, // Explicitly include discount code at top level
  body: parsedBody,
  adminEmail: parsedBody.recipients?.admin || ADMIN_EMAIL,
};
```
