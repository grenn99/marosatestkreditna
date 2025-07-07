import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react';
import { SHIPPING } from '../config/appConfig';

/**
 * A banner that promotes free shipping to encourage higher order values
 */
export function FreeShippingBanner() {
  const { t } = useTranslation();

  return (
    <div className="bg-amber-50 border-y border-amber-200 py-2 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-amber-800">
          <Truck className="w-5 h-5 text-amber-600" />
          <p className="text-sm md:text-base font-medium">
            {t('promotions.freeShipping', 'Brezplačna dostava za naročila nad {{amount}}€', {
              amount: SHIPPING.freeThreshold.toFixed(2)
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
