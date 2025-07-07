import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckoutStep } from '../../../types/checkout';

interface CheckoutMethodStepProps {
  onSelectMethod: (method: CheckoutStep) => void;
}

/**
 * Step 1: Checkout Method Selection
 * Allows the user to choose between guest checkout or login
 */
export const CheckoutMethodStep: React.FC<CheckoutMethodStepProps> = ({ 
  onSelectMethod 
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {t('checkout.chooseCheckoutMethod', 'Izberite način nakupa')}
      </h2>
      
      <div className="space-y-4">
        {/* Guest Checkout */}
        <button
          onClick={() => onSelectMethod('guest_form')}
          className="w-full p-4 border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center transition-colors"
        >
          <span className="font-medium">
            {t('checkout.guestCheckout', 'Nadaljuj kot gost')}
          </span>
          <span className="text-gray-500">→</span>
        </button>
        
        {/* Login */}
        <button
          onClick={() => onSelectMethod('auth_form')}
          className="w-full p-4 border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center transition-colors"
        >
          <span className="font-medium">
            {t('checkout.loginCheckout', 'Prijava')}
          </span>
          <span className="text-gray-500">→</span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutMethodStep;
