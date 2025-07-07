import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  orderId?: string;
  shippingAddress?: any; // Add shipping address prop
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  disabled = false,
  orderId,
  shippingAddress
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Function to handle redirection after successful payment
  const redirectToSuccessPage = (paymentIntentId: string) => {
    // Store payment information in session storage
    sessionStorage.setItem('stripe_payment_id', paymentIntentId);
    sessionStorage.setItem('stripe_payment_amount', amount.toString());
    sessionStorage.setItem('stripe_payment_used', 'true');
    sessionStorage.setItem('clearCartAfterOrder', 'true');

    // Store shipping address if available
    if (shippingAddress) {
      console.log('Storing shipping address in session storage:', shippingAddress);
      sessionStorage.setItem('stripe_shipping_address', JSON.stringify(shippingAddress));
    }

    // Create a temporary order in session storage
    const tempOrder = {
      id: `temp-${Date.now()}`,
      payment_id: paymentIntentId,
      amount: amount,
      created_at: new Date().toISOString()
    };

    // Store the temporary order in session storage
    sessionStorage.setItem('temp_order', JSON.stringify(tempOrder));

    // Small delay to ensure session storage is updated before navigation
    setTimeout(() => {
      // Navigate to the success page
      navigate(`/order-success?lang=${i18n.language}&payment_id=${paymentIntentId}`);
    }, 100);
  };

  // Track if there's an in-flight payment to prevent duplicate submissions
  const [hasInFlightPayment, setHasInFlightPayment] = useState(false);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // Prevent multiple submissions
    if (hasInFlightPayment || isProcessing) {
      console.log('Payment already in progress, ignoring additional click');
      return;
    }

    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded yet');
      setCardError('Stripe is not initialized. Please refresh the page and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('Card element not found');
      setCardError('Card element not found. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);
    setHasInFlightPayment(true);
    setCardError(null);

    try {
      // Check if we've recently had a failed payment intent creation
      // to avoid hammering the edge function with repeated failures
      const lastFailedAttempt = localStorage.getItem('last_payment_intent_failure');
      const now = Date.now();

      if (lastFailedAttempt) {
        const failureTime = parseInt(lastFailedAttempt, 10);
        const timeSinceFailure = now - failureTime;

        // If we've had a failure in the last 5 minutes, show an error
        if (timeSinceFailure < 5 * 60 * 1000) { // 5 minutes
          console.warn('Avoiding payment intent creation due to recent failure');
          throw new Error(t('checkout.paymentTemporarilyUnavailable', 'Payment processing is temporarily unavailable. Please try again in a few minutes.'));
        }
      }

      // Create payment intent on the server
      console.log('Creating payment intent for amount:', amount);
      const { data: paymentIntent, error: intentError, status } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'eur',
          orderId: orderId
        }
      });

      // Check for errors in the payment intent response
      if (intentError) {
        console.error('Intent error:', intentError);
        // Store the failure time to avoid repeated calls
        localStorage.setItem('last_payment_intent_failure', now.toString());
        throw new Error(intentError.message || t('checkout.paymentError', 'Failed to create payment'));
      }

      // Clear any stored failure on success
      localStorage.removeItem('last_payment_intent_failure');

      if (!paymentIntent || !paymentIntent.clientSecret) {
        console.error('No payment intent or client secret returned:', paymentIntent);
        throw new Error(t('checkout.paymentError', 'Failed to create payment: No client secret returned'));
      }

      // Confirm the payment with the client secret

      // Confirm the payment with the card element
      const { error: paymentError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      // Check for errors in the payment confirmation

      if (paymentError) {
        console.error('Payment confirmation error:', paymentError);
        throw new Error(paymentError.message || t('checkout.paymentFailed', 'Payment failed'));
      }

      if (!confirmedIntent) {
        console.error('No confirmed intent returned');
        throw new Error(t('checkout.paymentError', 'No payment confirmation returned'));
      }

      if (confirmedIntent.status === 'succeeded') {
        // Store the payment ID in session storage as a backup
        sessionStorage.setItem('stripe_payment_id', confirmedIntent.id);
        sessionStorage.setItem('stripe_payment_amount', amount.toString());
        sessionStorage.setItem('stripe_payment_used', 'true');

        // Call the success callback
        onSuccess(confirmedIntent.id);

        // Redirect to the success page
        redirectToSuccessPage(confirmedIntent.id);
      } else if (confirmedIntent.status === 'requires_action' || confirmedIntent.status === 'requires_confirmation') {
        // Handle 3D Secure or other additional authentication steps
        const { error, paymentIntent: updatedIntent } = await stripe.confirmCardPayment(paymentIntent.clientSecret);

        if (error) {
          throw new Error(error.message || t('checkout.paymentFailed', 'Payment authentication failed'));
        }

        if (updatedIntent.status === 'succeeded') {
          sessionStorage.setItem('stripe_payment_id', updatedIntent.id);
          sessionStorage.setItem('stripe_payment_amount', amount.toString());
          sessionStorage.setItem('stripe_payment_used', 'true');

          // Call the success callback
          onSuccess(updatedIntent.id);

          // Redirect to the success page
          redirectToSuccessPage(updatedIntent.id);
        } else {
          throw new Error(t('checkout.paymentNotCompleted', 'Payment not completed after authentication'));
        }
      } else {
        throw new Error(t('checkout.paymentNotCompleted', `Payment not completed. Status: ${confirmedIntent.status}`));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setCardError(error.message || t('checkout.paymentProcessingError', 'Error processing payment'));
      onError(error.message || t('checkout.paymentProcessingError', 'Error processing payment'));
    } finally {
      setIsProcessing(false);
      setHasInFlightPayment(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 border border-gray-300 rounded-md bg-white">
        <CardElement options={cardElementOptions} />
      </div>

      {cardError && (
        <div className="text-red-600 text-sm mt-2">
          {cardError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || isProcessing || hasInFlightPayment || disabled}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          !stripe || isProcessing || hasInFlightPayment || disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('checkout.processing', 'Processing...')}
          </span>
        ) : (
          t('checkout.payNow', 'Pay Now')
        )}
      </button>
    </div>
  );
};
