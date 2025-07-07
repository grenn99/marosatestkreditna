# Security Documentation

This document outlines the security measures implemented in the Kmetija Maroša e-commerce application.

## Environment Variables

### Client-Side Environment Variables

The following environment variables are safe to use in the client-side code and can be included in the `.env` file that is deployed to Netlify:

- `VITE_SUPABASE_URL`: The URL of your Supabase project
- `VITE_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project
- `VITE_STRIPE_PUBLISHABLE_KEY`: The publishable key for Stripe

### Server-Side Environment Variables

The following environment variables should NEVER be included in client-side code or deployed to Netlify. They should only be stored in `.env.local` for local development and in Supabase Edge Functions for production:

- `SUPABASE_SERVICE_KEY`: The service key for your Supabase project (NEVER prefix with VITE_)
- `STRIPE_SECRET_KEY`: The secret key for Stripe (NEVER prefix with VITE_)
- `DATABASE_URL`: The connection string for your database (NEVER prefix with VITE_)
- `JWT_SECRET`: The secret used to sign JWT tokens (NEVER prefix with VITE_)

⚠️ **IMPORTANT SECURITY WARNING**: Never prefix sensitive variables with `VITE_` as this will expose them in the frontend code. Variables prefixed with `VITE_` are automatically included in the client-side bundle by Vite.

## Security Measures

### Content Security Policy (CSP)

A Content Security Policy has been implemented in the `index.html` file to prevent XSS attacks. The policy restricts:

- Scripts to only run from the same origin and Stripe
- Styles to only load from the same origin and cdnjs.cloudflare.com
- Images to only load from the same origin, data URLs, and HTTPS sources
- Connections to only be made to the same origin, Supabase, and Stripe
- Frames to only load from the same origin and Stripe
- Objects to not be loaded at all
- Forms to only submit to the same origin

### CORS Headers

CORS headers have been updated in Supabase Edge Functions to only allow requests from specific origins:

- https://marosakreditna.netlify.app
- http://localhost:5173
- http://localhost:3000

### Password Security

Password requirements have been strengthened to require:

- At least 10 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

A password strength meter has been added to provide feedback to users on the strength of their passwords.

#### Password Field Protection

To prevent sensitive information from being accidentally exposed in password fields:

- All password fields are protected against auto-filling with sensitive data
- MutationObserver is used to detect and clear any sensitive data that might be inserted by browser auto-fill
- Input validation blocks any attempt to enter API keys, JWT tokens, or database connection strings
- Password fields use `autoComplete="new-password"` and other attributes to discourage browser password managers from auto-filling sensitive data

### Data Encryption

Sensitive user data is encrypted before being stored in the database:

- Shipping addresses
- Personal information (name, address, phone)

The encryption is performed using the Web Crypto API with AES-GCM encryption.

### Log Sanitization

Logs are sanitized to remove sensitive information before being output to the console:

- Email addresses
- Phone numbers
- Addresses
- Names
- Postal codes
- Credit card numbers

### Row Level Security (RLS)

Supabase Row Level Security policies have been implemented to restrict access to data:

- Users can only view their own orders and profiles
- Admins can view and manage all data
- Public users can only view active products

## Security Best Practices

### For Developers

1. **Never commit sensitive information to Git**:
   - Use `.env.local` for local development
   - Use Netlify environment variables for production
   - Use Supabase Edge Functions for server-side code

2. **Always validate user input**:
   - Use the validation functions in `src/utils/validation.ts`
   - Sanitize user input before storing it in the database

3. **Use encryption for sensitive data**:
   - Use the encryption functions in `src/utils/encryption.ts`
   - Encrypt sensitive data before storing it in the database

4. **Use safe logging**:
   - Use the logging functions in `src/utils/logSanitizer.ts`
   - Never log sensitive information

### For Administrators

1. **Regularly rotate API keys**:
   - Rotate Supabase API keys
   - Rotate Stripe API keys

2. **Monitor for suspicious activity**:
   - Check Supabase logs for unusual activity
   - Monitor Stripe dashboard for unusual transactions

3. **Keep dependencies up to date**:
   - Regularly update npm packages
   - Check for security vulnerabilities with `npm audit`

## Security Contacts

If you discover a security vulnerability, please contact:

- Email: [security@kmetija-marosa.si](mailto:security@kmetija-marosa.si)
