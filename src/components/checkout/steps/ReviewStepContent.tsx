import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckoutDisplayItem, CheckoutFormData } from '../../../types/checkout';

interface ReviewStepContentProps {
  formData: CheckoutFormData;
  cartItemsDetails: CheckoutDisplayItem[];
  subtotal: number;
  shippingCost: number;
  appliedDiscount: any;
  paymentMethod: string;
  isSubmitting: boolean;
}

export const ReviewStepContent: React.FC<ReviewStepContentProps> = ({
  formData,
  cartItemsDetails,
  subtotal,
  shippingCost,
  appliedDiscount,
  paymentMethod,
  isSubmitting
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Function to get localized product name
  const getLocalizedName = (item: CheckoutDisplayItem) => {
    if (currentLanguage === 'en' && item.name_en) return item.name_en;
    if (currentLanguage === 'de' && item.name_de) return item.name_de;
    if (currentLanguage === 'hr' && item.name_hr) return item.name_hr;
    return item.name;
  };

  // Calculate total with discount
  const calculateTotal = () => {
    let total = subtotal + shippingCost;

    if (appliedDiscount) {
      // Use the calculated discount from the validation
      if (appliedDiscount.calculatedDiscount) {
        total -= appliedDiscount.calculatedDiscount;
      } else if (appliedDiscount.discount_type === 'percentage') {
        total -= (subtotal * (appliedDiscount.discount_value / 100));
      } else if (appliedDiscount.discount_type === 'fixed') {
        total -= appliedDiscount.discount_value;
      }
    }

    return Math.max(0, total);
  };

  // Format payment method for display
  const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case 'pay_on_delivery':
        return t('checkout.paymentOptions.payOnDelivery', 'Plačilo po povzetju');
      case 'bank_transfer':
        return t('checkout.paymentOptions.bankTransfer', 'Neposredno bančno nakazilo');
      case 'credit_card':
        return t('checkout.paymentOptions.creditCard', 'Kreditna kartica');
      default:
        return paymentMethod;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.reviewOrder', 'Pregled naročila')}</h3>
      
      {/* Order Items */}
      <div className="border-b pb-4 mb-4">
        <h4 className="font-medium mb-2">{t('checkout.items', 'Izdelki')}</h4>
        <ul className="divide-y divide-gray-200">
          {cartItemsDetails.map((item) => (
            <li key={item.id + (item.packageOption?.uniq_id || '')} className="py-3 flex justify-between">
              <div>
                <span className="font-medium">{getLocalizedName(item)}</span>
                <div className="text-sm text-gray-500">
                  {item.packageOption?.description} × {item.quantity}
                </div>
                {item.isGift && (
                  <div className="text-xs text-blue-600 mt-1">
                    {t('checkout.gift', 'Darilo')}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })
                    .format((item.packageOption?.price || 0) * item.quantity)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Customer Information */}
      <div className="border-b pb-4 mb-4">
        <h4 className="font-medium mb-2">{t('checkout.customerInfo', 'Podatki o stranki')}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('checkout.name', 'Ime')}</p>
            <p>{formData.name}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('checkout.email', 'E-pošta')}</p>
            <p>{formData.email}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('checkout.phone', 'Telefon')}</p>
            <p>{formData.phone}</p>
          </div>
        </div>
      </div>
      
      {/* Shipping Address */}
      <div className="border-b pb-4 mb-4">
        <h4 className="font-medium mb-2">{t('checkout.shippingAddress', 'Naslov za dostavo')}</h4>
        <p className="text-sm">
          {formData.name}<br />
          {formData.address}<br />
          {formData.postalCode} {formData.city}<br />
          {formData.country}
        </p>
      </div>
      
      {/* Payment Method */}
      <div className="border-b pb-4 mb-4">
        <h4 className="font-medium mb-2">{t('checkout.paymentMethod', 'Način plačila')}</h4>
        <p className="text-sm">{getPaymentMethodDisplay()}</p>
      </div>
      
      {/* Order Notes */}
      {formData.notes && (
        <div className="border-b pb-4 mb-4">
          <h4 className="font-medium mb-2">{t('checkout.notes', 'Opombe')}</h4>
          <p className="text-sm">{formData.notes}</p>
        </div>
      )}
      
      {/* Order Summary */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">{t('checkout.orderSummary', 'Povzetek naročila')}</h4>
        <div className="text-sm">
          <div className="flex justify-between py-1">
            <span>{t('checkout.subtotal', 'Vmesna vsota')}</span>
            <span>{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>{t('checkout.shipping', 'Poštnina')}</span>
            <span>{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(shippingCost)}</span>
          </div>
          {appliedDiscount && (
            <div className="flex justify-between py-1 text-green-600">
              <span>{t('checkout.discount', 'Popust')} ({appliedDiscount.code})</span>
              <span>
                {appliedDiscount.calculatedDiscount
                  ? `-${new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(appliedDiscount.calculatedDiscount)}`
                  : appliedDiscount.discount_type === 'percentage'
                    ? `-${appliedDiscount.discount_value}%`
                    : `-${new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(appliedDiscount.discount_value)}`}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 font-medium text-base border-t mt-2">
            <span>{t('checkout.total', 'Skupaj')}</span>
            <span>{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(calculateTotal())}</span>
          </div>
        </div>
      </div>
      
      {/* Submit button is handled in the parent component */}
    </div>
  );
};

export default ReviewStepContent;
