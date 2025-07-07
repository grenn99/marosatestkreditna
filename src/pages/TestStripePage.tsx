import React from 'react';
import { TestStripeEnv } from '../components/TestStripeEnv';

export const TestStripePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Stripe Integration Test</h1>
      <TestStripeEnv />
    </div>
  );
};
