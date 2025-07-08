import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Check, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartNotificationWrapper: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, showNotification, hideNotification } = useCart();

  // Auto-hide after 4 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, hideNotification]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleViewCart = () => {
    navigate('/cart');
    hideNotification();
  };

  if (!showNotification) return null;

  return (
    <>
      {/* Desktop Toast */}
      <div className="hidden md:block fixed top-4 right-4 z-50 animate-slide-in-right">
        <div className="bg-white border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900 flex-1">
              {t('cart.itemAdded', 'Dodano v košarico')}
            </span>
            <button onClick={hideNotification} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={handleViewCart}
              className="flex items-center space-x-1 bg-amber-600 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('cart.viewCart', 'Poglej košarico')} ({cartCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white border-t border-gray-200 shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {t('cart.itemAdded', 'Dodano v košarico')}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={hideNotification}
                className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm"
              >
                {t('common.continue', 'Nadaljuj')}
              </button>
              <button
                onClick={handleViewCart}
                className="flex items-center space-x-1 bg-amber-600 text-white px-3 py-1 rounded text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('cart.viewCart', 'Košarica')} ({cartCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  );
};
