import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../../StripePaymentForm';
import { PaymentMethodSelector } from '../PaymentMethodSelector';
import { PAYMENT_METHODS } from '../../../config/appConfig';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
  setError: (error: string | null) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  onNext,
  onBack,
  setError
}) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>('pay_on_delivery');
  const [stripePaymentComplete, setStripePaymentComplete] = useState<boolean>(false);
  const [stripePaymentId, setStripePaymentId] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  // Handle payment method selection
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setStripeError(null);
    setError(null);
  };

  // Handle Stripe payment completion
  const handleStripePaymentComplete = (paymentId: string) => {
    setStripePaymentComplete(true);
    setStripePaymentId(paymentId);
    setStripeError(null);
    
    // Store payment ID in session storage for order completion
    sessionStorage.setItem('stripe_payment_id', paymentId);
    sessionStorage.setItem('stripe_payment_used', 'true');
  };

  // Handle Stripe payment error
  const handleStripeError = (errorMessage: string) => {
    setStripeError(errorMessage);
    setStripePaymentComplete(false);
    setStripePaymentId(null);
  };

  // Validate payment before proceeding
  const validatePayment = async (): Promise<boolean> => {
    // Reset errors
    setError(null);
    
    // For credit card payments, ensure Stripe payment is complete
    if (paymentMethod === 'credit_card') {
      if (!stripe || !elements) {
        setError(t('checkout.errors.stripeNotLoaded', 'Payment processing is not available. Please try again later.'));
        return false;
      }
      
      if (!stripePaymentComplete) {
        setError(t('checkout.errors.incompletePayment', 'Please complete the payment information'));
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (await validatePayment()) {
      // Store payment method in session storage
      sessionStorage.setItem('payment_method', paymentMethod);
      
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {t('checkout.steps.payment', 'Payment')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onChange={handlePaymentMethodChange}
            paymentMethods={PAYMENT_METHODS}
          />
        </div>
        
        {paymentMethod === 'credit_card' && (
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-4">
              {t('checkout.creditCardDetails', 'Credit Card Details')}
            </h3>
            
            <StripePaymentForm
              onPaymentComplete={handleStripePaymentComplete}
              onError={handleStripeError}
              processingPayment={processingPayment}
              setProcessingPayment={setProcessingPayment}
            />
            
            {stripePaymentComplete && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                {t('checkout.paymentAuthorized', 'Payment authorized successfully')}
              </div>
            )}
            
            {stripeError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {stripeError}
              </div>
            )}
          </div>
        )}
        
        {paymentMethod === 'bank_transfer' && (
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-4">
              {t('checkout.bankTransferInfo', 'Bank Transfer Information')}
            </h3>
            
            <p className="mb-2">
              {t('checkout.bankTransferInstructions', 'Please transfer the total amount to the following bank account:')}
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p><strong>{t('checkout.bankName', 'Bank Name')}:</strong> Banka Slovenije</p>
              <p><strong>{t('checkout.accountHolder', 'Account Holder')}:</strong> Kmetija Maroša</p>
              <p><strong>IBAN:</strong> SI56 1234 5678 9012 345</p>
              <p><strong>{t('checkout.reference', 'Reference')}:</strong> {t('checkout.orderNumber', 'Order number will be provided after order placement')}</p>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              {t('checkout.bankTransferNote', 'Your order will be processed after we receive your payment. Please include your order number in the payment reference.')}
            </p>
          </div>
        )}
        
        {paymentMethod === 'pay_on_delivery' && (
          <div className="mb-6 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-4">
              {t('checkout.payOnDeliveryInfo', 'Pay on Delivery Information')}
            </h3>
            
            <p className="text-gray-700">
              {t('checkout.payOnDeliveryInstructions', 'You will pay the full amount when you receive your order. Payment can be made in cash or by card to our delivery person.')}
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={processingPayment}
          >
            {t('checkout.back', 'Back')}
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={processingPayment}
          >
            {t('checkout.continue', 'Continue')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentStep;
