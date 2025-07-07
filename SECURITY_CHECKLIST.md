# Security Checklist

Use this checklist to verify that all security improvements have been properly implemented.

## Environment Variables

- [ ] Sensitive variables do NOT have `VITE_` prefix:
  - [ ] `SUPABASE_SERVICE_KEY` (not `VITE_SUPABASE_SERVICE_KEY`)
  - [ ] `STRIPE_SECRET_KEY` (not `VITE_STRIPE_SECRET_KEY`)
  - [ ] `DATABASE_URL` (not `VITE_DATABASE_URL`)
  - [ ] `JWT_SECRET` (not `VITE_JWT_SECRET`)
- [ ] Client-safe variables have `VITE_` prefix:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] All secrets have been rotated:
  - [ ] Supabase service key
  - [ ] Stripe secret key
  - [ ] Database password
  - [ ] JWT secret

## Server-Side Admin Role Checking

- [ ] Supabase Edge Function `check-admin-role` is deployed
- [ ] Admin menu items appear for admin users
- [ ] Admin menu items do NOT appear for non-admin users
- [ ] Admin pages are protected from unauthorized access

## Password Field Security

- [ ] Password fields clear any sensitive data automatically
- [ ] Password fields have proper attributes to prevent auto-fill of sensitive data
- [ ] Password validation is working correctly
- [ ] Password strength meter is displayed during registration

## Content Security Policy

- [ ] CSP headers are being applied (check browser console for violations)
- [ ] All resources load correctly with the CSP in place
- [ ] No inline scripts or styles are blocked
- [ ] External resources from allowed domains load correctly

## Encryption

- [ ] Sensitive data is properly encrypted
- [ ] Encrypted data can be decrypted and displayed correctly
- [ ] Legacy encrypted data (if any) can still be decrypted

## Checkout Process

- [ ] Checkout process works correctly
- [ ] User profiles are created/updated correctly
- [ ] Shipping addresses are properly encrypted
- [ ] Order data is stored securely

## General Security

- [ ] No sensitive data is exposed in the frontend code
- [ ] No sensitive data is logged to the console
- [ ] Error messages don't reveal sensitive information
- [ ] All API endpoints are properly secured

## Deployment

- [ ] Application builds successfully
- [ ] Application deploys to Netlify without errors
- [ ] Environment variables are correctly set in Netlify
- [ ] Content Security Policy headers are applied in production

## Monitoring

- [ ] Error logging is configured
- [ ] Security events are logged
- [ ] Monitoring is in place for suspicious activity

## Documentation

- [ ] Security documentation is up to date
- [ ] Deployment guide is clear and complete
- [ ] Security checklist is complete and accurate
- [ ] Incident response plan is in place
