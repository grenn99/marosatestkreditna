import React from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS } from '../../config/appConfig';

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  isSubmitting: boolean;
  stripeError: string | null;
}

/**
 * Component for selecting payment method (credit card or pay on delivery)
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  isSubmitting,
  stripeError
}) => {
  const { t } = useTranslation();

  // No card element style needed anymore

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('checkout.paymentMethod', 'Način plačila')}</h2>

      <div className="space-y-4">
        {/* Payment method selection */}
        <div className="flex flex-col space-y-3">
          {/* Credit Card */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value={PAYMENT_METHODS.creditCard}
              checked={paymentMethod === PAYMENT_METHODS.creditCard}
              onChange={() => onPaymentMethodChange(PAYMENT_METHODS.creditCard)}
              className="mt-1"
              disabled={isSubmitting}
            />
            <div className="flex-1">
              <span className="font-medium block">
                {t('checkout.creditCard', 'Kreditna kartica')}
              </span>
              <span className="text-sm text-gray-600 block">
                {t('checkout.securePayment', 'Varno plačilo s kreditno kartico')}
              </span>

              {/* Display error message if there's a Stripe error */}
              {paymentMethod === PAYMENT_METHODS.creditCard && stripeError && (
                <div className="mt-3">
                  <div className="text-red-500 text-sm">{stripeError}</div>
                </div>
              )}
            </div>
          </label>

          {/* Pay on Delivery */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value={PAYMENT_METHODS.payOnDelivery}
              checked={paymentMethod === PAYMENT_METHODS.payOnDelivery}
              onChange={() => onPaymentMethodChange(PAYMENT_METHODS.payOnDelivery)}
              className="mt-1"
              disabled={isSubmitting}
            />
            <div>
              <span className="font-medium block">
                {t('checkout.payOnDelivery', 'Plačilo po povzetju')}
              </span>
              <span className="text-sm text-gray-600 block">
                {t('checkout.payOnDeliveryDescription', 'Plačilo ob dostavi paketa')}
              </span>
            </div>
          </label>

          {/* Bank Transfer */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value={PAYMENT_METHODS.bankTransfer}
              checked={paymentMethod === PAYMENT_METHODS.bankTransfer}
              onChange={() => onPaymentMethodChange(PAYMENT_METHODS.bankTransfer)}
              className="mt-1"
              disabled={isSubmitting}
            />
            <div>
              <span className="font-medium block">
                {t('checkout.bankTransfer', 'Neposredno bančno plačilo')}
              </span>
              <span className="text-sm text-gray-600 block">
                {t('checkout.bankTransferDescription', 'Plačilo z nakazilom na bančni račun')}
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
