import React from 'react';
import { useTranslation } from 'react-i18next';
import { SHIPPING } from '../../config/appConfig';
import { ShippingCostNotification } from '../ShippingCostNotification';

interface CheckoutDisplayItem {
  id: string;
  name: string;
  name_en: string;
  name_de: string;
  name_hr: string;
  packageOption: {
    price: number;
    weight?: string;
    description?: string;
  };
  quantity: number;
  image_url: string;
  isGift?: boolean;
  giftDetails?: any;
}

interface CheckoutSummaryProps {
  cartItems: CheckoutDisplayItem[];
  loading: boolean;
  discountAmount?: number;
  discountCode?: string;
  giftOptionCost?: number;
  giftOptionName?: string;
  giftProductCost?: number;
  giftProductName?: string;
}

/**
 * Displays the order summary with item details, subtotal, shipping cost, and total
 */
export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cartItems,
  loading,
  discountAmount = 0,
  discountCode = '',
  giftOptionCost = 0,
  giftOptionName = '',
  giftProductCost = 0,
  giftProductName = ''
}) => {
  const { t, i18n } = useTranslation();

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.packageOption?.price ?? 0;
      return total + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Calculate subtotal after discount
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);

  // Calculate if shipping is free
  const hasShippingFee = subtotalAfterDiscount < SHIPPING.freeThreshold;
  const shippingCost = hasShippingFee ? SHIPPING.cost : 0;

  // Calculate total with shipping, discount, gift option, and gift product
  const total = subtotalAfterDiscount + shippingCost + giftOptionCost + giftProductCost;

  // Debug: Log CheckoutSummary values
  console.log('=== CHECKOUT SUMMARY COMPONENT ===');
  console.log('Received discountAmount prop:', discountAmount);
  console.log('Received discountCode prop:', discountCode);
  console.log('Subtotal:', subtotal);
  console.log('Subtotal after discount:', subtotalAfterDiscount);
  console.log('Final total:', total);
  console.log('===================================');

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('checkout.orderSummary', 'Povzetek naročila')}</h2>

      {/* Items list */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => {
          const itemName = item[`name_${i18n.language}` as keyof typeof item] || item.name;
          const packageInfo = item.packageOption?.weight || item.packageOption?.description || '';
          const price = item.packageOption?.price ?? 0;
          const isGift = item.isGift || false;

          return (
            <div key={`${item.id}-${item.packageOption?.weight}`} className="flex justify-between">
              <div>
                {isGift ? (
                  // Gift item display
                  <span className="font-medium text-amber-600">
                    🎁 {itemName}
                  </span>
                ) : (
                  // Regular item display
                  <span className="font-medium">{itemName}</span>
                )}
                {packageInfo && <span className="text-sm text-gray-600 ml-1">({packageInfo})</span>}
                <span className="text-sm text-gray-600 ml-1">x {item.quantity}</span>

                {/* Show gift details if available */}
                {isGift && item.giftDetails?.recipient_name && (
                  <div className="text-xs text-amber-700 mt-1">
                    {t('checkout.giftFor', 'Za')}: {item.giftDetails.recipient_name}
                  </div>
                )}
              </div>
              <span className={`font-medium ${isGift ? 'text-amber-600' : ''}`}>
                €{(price * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      <div className="flex justify-between py-2 border-t border-gray-200">
        <span>{t('checkout.subtotal', 'Vmesna vsota')}</span>
        <span className="font-medium">€{subtotal.toFixed(2)}</span>
      </div>

      {/* Discount */}
      {(() => {
        console.log('Discount condition check:', { discountAmount, discountCode, condition: discountAmount > 0 && discountCode });
        return discountAmount > 0 && discountCode ? (
          <div className="flex justify-between py-2 text-green-600">
            <span>{t('checkout.discount', 'Popust')} ({discountCode})</span>
            <span className="font-medium">-€{discountAmount.toFixed(2)}</span>
          </div>
        ) : null;
      })()}

      {/* Gift Option */}
      {giftOptionCost > 0 && giftOptionName && (
        <div className="flex justify-between py-2 text-amber-600">
          <span>{t('checkout.giftOption', 'Darilna embalaža')} ({giftOptionName})</span>
          <span className="font-medium">€{giftOptionCost.toFixed(2)}</span>
        </div>
      )}

      {/* Gift Product */}
      {giftProductCost > 0 && giftProductName && (
        <div className="flex justify-between py-2 text-amber-600">
          <span>{t('checkout.giftProduct', 'Darilo')} ({giftProductName})</span>
          <span className="font-medium">€{giftProductCost.toFixed(2)}</span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between py-2 border-b border-gray-200">
        <span>{t('checkout.shipping', 'Poštnina')}</span>
        <span className="font-medium">
          {hasShippingFee
            ? `€${shippingCost.toFixed(2)}`
            : t('checkout.freeShipping', 'Brezplačno')}
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between py-3 font-bold text-lg">
        <span>{t('checkout.total', 'Skupaj')}</span>
        <span>€{total.toFixed(2)}</span>
      </div>

      {/* Shipping cost notification */}
      <ShippingCostNotification
        subtotal={subtotal}
        freeShippingThreshold={SHIPPING.freeThreshold}
        shippingCost={SHIPPING.cost}
      />
    </div>
  );
};
