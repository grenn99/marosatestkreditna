import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripeClient';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // Define appearance options for Stripe Elements
  const options = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4F7942', // Green color to match your site
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#df1b41',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};
