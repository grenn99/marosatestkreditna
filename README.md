# Kmetija Marosa Web Application

A web application for Kmetija Marosa, a farm products e-commerce site.

## Security Features

This application includes several security features to protect user data and prevent unauthorized access:

### Environment Variable Security

- Sensitive variables are never exposed in the frontend
- Clear separation between client-safe and sensitive variables
- Deployment script includes checks to prevent accidental exposure of sensitive data

### Server-Side Admin Role Checking

- Admin roles are verified on the server side using Supabase Edge Functions
- Client-side fallback for admin checking during development
- Protection against unauthorized access to admin features

### Enhanced Password Security

- Strong password requirements and validation
- Password strength meter during registration
- Protection against sensitive data in password fields
- Secure password change functionality

### Content Security Policy

- Strict CSP to prevent XSS attacks
- Resource loading restricted to trusted domains
- Protection against data exfiltration
- Additional security headers for comprehensive protection

### Client-Side Encryption

- Enhanced encryption for sensitive data
- PBKDF2-based key derivation with high iteration count
- Versioned encryption format for future upgrades
- Backward compatibility with legacy encrypted data

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Supabase account
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

See the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions on deploying the application.

#### Netlify Deployment

The application is deployed to Netlify under the name 'marosatest1'. The deployment process includes:

- Automatic builds from the GitHub repository
- Environment variable configuration for Supabase and Stripe
- Custom domain configuration
- Continuous deployment with preview builds for pull requests
- Automatic SSL certificate provisioning
- Performance optimization with asset compression

### Security Checklist

Use the [Security Checklist](SECURITY_CHECKLIST.md) to verify that all security features are properly implemented.

## Features

### E-commerce Functionality

- Product catalog with categories and filtering
- Shopping cart with persistent storage
- Secure checkout process with multiple payment options
- Order history and tracking
- User account management

### Gift Feature (Darilo)

- Dedicated gift product page for selecting gift packages
- Gift builder for customizing gifts with multiple products
- Gift recipient information and delivery address management
- Gift options in checkout process
- Gift order tracking and display in order history

## Documentation

- [Security Documentation](SECURITY.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Security Checklist](SECURITY_CHECKLIST.md)
- [Gift Feature Updates](gift_feature_updates.md)

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
