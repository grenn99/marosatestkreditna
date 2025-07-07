import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TimeLimitedDiscount } from '../services/discountService';

interface LimitedTimeOfferProps {
  discount: TimeLimitedDiscount;
  dismissed: boolean;
  onDismiss: () => void;
}

export function LimitedTimeOffer({
  discount,
  dismissed,
  onDismiss
}: LimitedTimeOfferProps) {
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

  // Calculate time remaining - SIMPLIFIED VERSION
  useEffect(() => {
    if (!discount) return;

    // SIMPLIFIED: Always set a fixed time left of 30 days
    setTimeLeft({
      days: 30,
      hours: 0,
      minutes: 0
    });

    // No need for interval updates with fixed time
    return () => {};
  }, [discount]);

  // FORCE BANNER: Always render the banner regardless of timeLeft
  // Don't render only if dismissed or no discount
  if (dismissed || !discount) {
    return null;
  }

  // Force timeLeft to have a value if it's zero
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    timeLeft.days = 30; // Force 30 days remaining
    timeLeft.hours = 0;
    timeLeft.minutes = 0;
  }

  // Determine the link destination
  let linkTo = '/';
  if (discount.product_id) {
    linkTo = `/product/${discount.product_id}?lang=${i18n.language}`;
  } else if (discount.category) {
    linkTo = `/?category=${encodeURIComponent(discount.category)}&lang=${i18n.language}`;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-brown-600 text-white py-3 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-bold">
              {t('promotions.limitedTimeOffer', 'Časovno omejena ponudba')}
            </span>
          </div>

          <div className="font-medium">
            {/* Generate banner text based on discount type and use translations */}
            {discount.discount_type === 'fixed'
              ? t('promotions.fixedDiscountBanner', 'Uporabite kodo {{code}} za €{{amount}} popusta pri nakupu nad €{{minOrder}}!', {
                  code: i18n.language === 'sl' ? 'BREZPOSTNINE' : 'FREESHIPPING',
                  amount: discount.discount_value.toFixed(2),
                  minOrder: discount.min_order_amount.toFixed(2)
                })
              : discount.product_name
                ? t('promotions.productDiscount', '{{percent}}% popusta na {{product}}', {
                    percent: discount.discount_value,
                    product: discount.product_name
                  })
                : discount.category
                  ? t('promotions.categoryDiscount', '{{percent}}% popusta na vse izdelke {{category}}', {
                      percent: discount.discount_value,
                      category: discount.category
                    })
                  : t('promotions.siteWideDiscount', '{{percent}}% popusta na izbrane izdelke', {
                      percent: discount.discount_value
                    })
            }
          </div>

          <div className="flex items-center gap-1">
            <span>{t('discount.endsIn', 'Poteče čez')}:</span>
            <div className="flex items-center gap-1">
              {timeLeft.days > 0 && (
                <span className="font-mono">
                  {timeLeft.days}{t('discount.days', 'dni')}
                </span>
              )}
              <span className="font-mono">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
              </span>
            </div>
          </div>

          <Link
            to={linkTo}
            className="bg-white text-brown-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-amber-50 transition-colors"
          >
            {t('promotions.shopNow', 'Nakupuj zdaj')}
          </Link>
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
