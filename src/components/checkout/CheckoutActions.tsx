import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface CheckoutActionsProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Component for checkout action buttons (back to cart, submit order)
 */
export const CheckoutActions: React.FC<CheckoutActionsProps> = ({
  onSubmit,
  isSubmitting,
  isValid
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-6 space-y-4">
      {/* Back to cart button */}
      <Link
        to="/cart"
        className="flex items-center text-brown-600 hover:text-brown-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('checkout.backToCart', 'Nazaj na košarico')}
      </Link>
      
      {/* Submit order button */}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting || !isValid}
        className={`w-full py-3 px-4 flex justify-center items-center rounded-md text-white font-medium 
          ${isSubmitting || !isValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500'
          } transition-colors`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('checkout.processing', 'Obdelava...')}
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            {t('checkout.placeOrder', 'Oddaj naročilo')}
          </>
        )}
      </button>
      
      {/* Terms and conditions notice */}
      <p className="text-sm text-gray-600 text-center">
        {t('checkout.termsNotice', 'Z oddajo naročila se strinjate s pogoji poslovanja.')}
      </p>
    </div>
  );
};
