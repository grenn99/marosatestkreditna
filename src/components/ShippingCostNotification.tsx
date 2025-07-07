import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react';

interface ShippingCostNotificationProps {
  subtotal: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

export function ShippingCostNotification({
  subtotal,
  shippingCost,
  freeShippingThreshold
}: ShippingCostNotificationProps) {
  const { t } = useTranslation();

  // Calculate how much more needed for free shipping
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Determine if free shipping is achieved
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className="bg-amber-50 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Truck className="w-5 h-5 text-amber-600 mr-2" />
        <h3 className="font-medium text-amber-800">
          {hasFreeShipping
            ? t('cart.freeShippingAchieved', 'Brezplačna dostava!')
            : t('cart.shippingCost', 'Strošek dostave')}
        </h3>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-amber-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-amber-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {hasFreeShipping ? (
        <p className="text-sm text-green-600 font-medium">
          {t('cart.qualifiedForFreeShipping', 'Vaše naročilo je upravičeno do brezplačne dostave!')}
        </p>
      ) : (
        <p className="text-sm text-amber-700">
          {t('cart.addMoreForFreeShipping', 'Dodajte še za {{amount}}, da pridobite brezplačno dostavo!', {
            amount: `${amountToFreeShipping.toFixed(2)}€`
          })}
        </p>
      )}

      <div className="mt-2 text-xs text-amber-600">
        {t('cart.shippingPolicy', 'Naročila pod {{threshold}}€ imajo strošek dostave {{cost}}€.', {
          threshold: freeShippingThreshold.toFixed(2),
          cost: shippingCost.toFixed(2)
        })}
      </div>
    </div>
  );
}
