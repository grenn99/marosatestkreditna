import { loadStripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validate that the key is available
if (!stripePublishableKey) {
  console.error('Stripe publishable key is missing. Please check your .env file.');
}

export const stripePromise = loadStripe(stripePublishableKey);
