import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, X } from 'lucide-react';

interface SimpleBannerProps {
  onDismiss: () => void;
}

export function SimpleBanner({ onDismiss }: SimpleBannerProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-amber-500 to-brown-600 text-white py-2 sm:py-3 relative">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-bold text-sm sm:text-base">
              {t('promotions.limitedTimeOffer', 'Limited time offer')}
            </span>
          </div>

          <div className="font-medium text-xs sm:text-sm md:text-base">
            {t('promotions.fixedDiscountBanner', 'Uporabite kodo {{code}} za €{{amount}} popusta pri nakupu nad €{{minOrder}}!', {
              code: i18n.language === 'sl' ? 'BREZPOSTNINE' : 'FREESHIPPING',
              amount: '3.90',
              minOrder: '20.00'
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <span className="text-sm">{t('discount.endsIn', 'Expires in')}:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm">
                30 {t('discount.days', 'days')}
              </span>
            </div>
          </div>

          <a
            href="/"
            className="bg-white text-brown-700 px-3 py-1 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-medium hover:bg-amber-50 transition-colors"
          >
            {t('promotions.shopNow', 'Shop Now')}
          </a>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 text-white/90 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all duration-200"
        aria-label={t('common.close', 'Close')}
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}
