import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Discount, formatDiscount } from '../utils/discountSystem';

interface DiscountBannerProps {
  discount: Discount;
  onApply?: () => void;
  className?: string;
}

/**
 * Component to display a promotional discount banner
 */
export const DiscountBanner: React.FC<DiscountBannerProps> = ({
  discount,
  onApply,
  className = ''
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Calculate time left if there's an end date
  useEffect(() => {
    if (!discount.endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(discount.endDate as Date);
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days} ${t('discount.days', 'days')} ${hours} ${t('discount.hours', 'hours')}`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} ${t('discount.hours', 'hours')} ${minutes} ${t('discount.minutes', 'minutes')}`);
      } else {
        setTimeLeft(`${minutes} ${t('discount.minutes', 'minutes')}`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [discount.endDate, t]);

  // Copy discount code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(discount.code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className={`bg-brown-100 border-l-4 border-brown-500 p-4 rounded-md shadow-md ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brown-800">
            {discount.description || t('discount.specialOffer', 'Special Offer')}
          </h3>
          <p className="text-brown-700 font-medium mt-1">
            {formatDiscount(discount)}
          </p>
          {timeLeft && (
            <p className="text-sm text-brown-600 mt-1">
              {t('discount.endsIn', 'Ends in')}: {timeLeft}
            </p>
          )}
        </div>

        <div className="mt-3 md:mt-0 flex items-center">
          <div className="relative">
            <div className="flex items-center border border-brown-300 rounded-l-md bg-white px-3 py-2">
              <span className="font-mono text-brown-800">{discount.code}</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="absolute top-0 right-0 h-full bg-brown-500 text-white px-3 rounded-r-md hover:bg-brown-600 transition-colors"
            >
              {copied ? t('discount.copied', 'Copied!') : t('discount.copy', 'Copy')}
            </button>
          </div>
          {onApply && (
            <button
              onClick={onApply}
              className="ml-3 bg-brown-600 text-white px-4 py-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              {t('discount.apply', 'Apply')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
