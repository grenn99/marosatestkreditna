import React from 'react';
import { useTranslation } from 'react-i18next';

// Define the props for this component
interface CheckoutStepsContainerProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | string, value?: string) => void;
  handleSubmit: () => void;
  paymentMethod: string;
  handlePaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CheckoutStepsContainer: React.FC<CheckoutStepsContainerProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  paymentMethod,
  handlePaymentChange
}) => {
  const { t } = useTranslation();
  
  // Simplified component that renders a single checkout page
  return (
    <div className="checkout-steps-container">
      {/* Simplified checkout without multi-step process */}
      <div className="checkout-header mb-6">
        <h2 className="text-xl font-semibold">{t('checkout.title', 'Checkout')}</h2>
      </div>
      
      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
            {/* User details section - using formData and handleInputChange */}
            <div className="user-details mb-4">
              <h3 className="text-lg font-medium mb-2">{t('checkout.userDetails', 'Your Details')}</h3>
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.name', 'Name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('checkout.email', 'Email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>

            {/* Payment methods section */}
            <div className="payment-methods mb-4">
              <h3 className="text-lg font-medium mb-2">{t('checkout.payment.method', 'Payment Method')}</h3>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={handlePaymentChange}
                  className="mr-2"
                />
                <label htmlFor="card">{t('checkout.payment.card', 'Credit Card')}</label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-brown-600 text-white rounded hover:bg-brown-700"
            >
              {t('checkout.complete', 'Complete Checkout')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
