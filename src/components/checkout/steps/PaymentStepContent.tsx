import React from 'react';
import { useTranslation } from 'react-i18next';
import { StripePaymentForm } from '../../StripePaymentForm';
import { DiscountCodeInput } from '../../DiscountCodeInput';

interface PaymentStepContentProps {
  paymentMethod: string;
  handlePaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stripePaymentComplete: boolean;
  stripeError: string | null;
  subtotal: number;
  setAppliedDiscount: (discount: any) => void;
}

export const PaymentStepContent: React.FC<PaymentStepContentProps> = ({
  paymentMethod,
  handlePaymentChange,
  stripePaymentComplete,
  stripeError,
  subtotal,
  setAppliedDiscount
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Discount Code */}
      <div className="mb-6">
        <DiscountCodeInput
          orderTotal={subtotal}
          onApply={(discount) => setAppliedDiscount(discount)}
        />
      </div>

      {/* Payment Methods */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.paymentInfo', 'Podatki o plačilu')}</h3>
        <fieldset>
          <legend className="sr-only">{t('checkout.paymentMethod', 'Način plačila')}</legend>
          <div className="space-y-4">
            {/* Pay on Delivery */}
            <div className="flex items-center">
              <input
                id="pay_on_delivery"
                name="paymentMethod"
                type="radio"
                value="pay_on_delivery"
                checked={paymentMethod === 'pay_on_delivery'}
                onChange={handlePaymentChange}
                required
                className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300"
              />
              <label htmlFor="pay_on_delivery" className="ml-3 block text-sm font-medium text-gray-700">
                {t('checkout.paymentOptions.payOnDelivery', 'Plačilo po povzetju')}
              </label>
            </div>
            
            {/* Direct Bank Transfer */}
            <div className="flex items-center">
              <input
                id="bank_transfer"
                name="paymentMethod"
                type="radio"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={handlePaymentChange}
                required
                className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300"
              />
              <label htmlFor="bank_transfer" className="ml-3 block text-sm font-medium text-gray-700">
                {t('checkout.paymentOptions.bankTransfer', 'Neposredno bančno nakazilo')}
              </label>
            </div>

            {/* Credit Card (Stripe) */}
            <div className="flex items-center">
              <input
                id="credit_card"
                name="paymentMethod"
                type="radio"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={handlePaymentChange}
                required
                className="focus:ring-brown-500 h-4 w-4 text-brown-600 border-gray-300"
              />
              <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-700">
                {t('checkout.paymentOptions.creditCard', 'Kreditna kartica')}
              </label>
            </div>

            {/* Stripe Payment Form - only shown when credit card is selected */}
            {paymentMethod === 'credit_card' && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md">
                <StripePaymentForm
                  isComplete={stripePaymentComplete}
                  error={stripeError}
                />
              </div>
            )}

            {/* Payment method descriptions */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
              {paymentMethod === 'pay_on_delivery' && (
                <div>
                  <h4 className="font-medium">{t('checkout.paymentOptions.payOnDelivery', 'Plačilo po povzetju')}</h4>
                  <p className="mt-1 text-gray-600">
                    {t('checkout.paymentDescriptions.payOnDelivery', 'Plačilo ob dostavi paketa. Možno je plačilo z gotovino ali kartico.')}
                  </p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div>
                  <h4 className="font-medium">{t('checkout.paymentOptions.bankTransfer', 'Neposredno bančno nakazilo')}</h4>
                  <p className="mt-1 text-gray-600">
                    {t('checkout.paymentDescriptions.bankTransfer', 'Naročilo bo poslano po prejemu plačila. Podatki za nakazilo bodo poslani na vaš e-poštni naslov.')}
                  </p>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <div>
                  <h4 className="font-medium">{t('checkout.paymentOptions.creditCard', 'Kreditna kartica')}</h4>
                  <p className="mt-1 text-gray-600">
                    {t('checkout.paymentDescriptions.creditCard', 'Varno plačilo s kreditno kartico. Podpiramo vse večje kartice.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </fieldset>
      </div>
    </>
  );
};

export default PaymentStepContent;
