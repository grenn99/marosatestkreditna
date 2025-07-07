import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const TestStripeEnv: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEnv = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing environment variables...');
      const { data, error: functionError, status } = await supabase.functions.invoke('test-env');
      
      console.log('Response status:', status);
      console.log('Response data:', data);
      console.log('Response error:', functionError);
      
      if (functionError) {
        throw new Error(functionError.message || 'Unknown error');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Error testing environment:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testStripe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing Stripe payment intent creation...');
      const { data, error: functionError, status } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: 1000, // $10.00
          currency: 'eur'
        }
      });
      
      console.log('Response status:', status);
      console.log('Response data:', data);
      console.log('Response error:', functionError);
      
      if (functionError) {
        throw new Error(functionError.message || 'Unknown error');
      }
      
      setResult(data);
    } catch (err: any) {
      console.error('Error testing Stripe:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Test Stripe Environment</h2>
      
      <div className="space-y-4">
        <button
          onClick={testEnv}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Environment Variables'}
        </button>
        
        <button
          onClick={testStripe}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 ml-4"
        >
          {loading ? 'Testing...' : 'Test Stripe Integration'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
