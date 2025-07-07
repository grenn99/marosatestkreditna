import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, X } from 'lucide-react';

interface SimpleBannerProps {
  onDismiss: () => void;
}

export function SimpleBanner({ onDismiss }: SimpleBannerProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-amber-500 to-brown-600 text-white py-3 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-bold">
              {t('promotions.limitedTimeOffer', 'Limited time offer')}
            </span>
          </div>

          <div className="font-medium">
            {t('promotions.fixedDiscountBanner', 'Uporabite kodo {{code}} za €{{amount}} popusta pri nakupu nad €{{minOrder}}!', {
              code: i18n.language === 'sl' ? 'BREZPOSTNINE' : 'FREESHIPPING',
              amount: '3.90',
              minOrder: '20.00'
            })}
          </div>

          <div className="flex items-center gap-1">
            <span>{t('discount.endsIn', 'Expires in')}:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">
                30 {t('discount.days', 'days')}
              </span>
            </div>
          </div>

          <a
            href="/"
            className="bg-white text-brown-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-amber-50 transition-colors"
          >
            {t('promotions.shopNow', 'Shop Now')}
          </a>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
        aria-label={t('common.close', 'Close')}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
