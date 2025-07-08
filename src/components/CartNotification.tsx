import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  name_en?: string;
  name_de?: string;
  name_hr?: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartNotificationProps {
  item: CartItem | null;
  isVisible: boolean;
  onClose: () => void;
  cartCount: number;
  cartTotal: number;
  autoHideDelay?: number;
}

export const CartNotification: React.FC<CartNotificationProps> = ({
  item,
  isVisible,
  onClose,
  cartCount,
  cartTotal,
  autoHideDelay = 4000
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Auto-hide after delay
  useEffect(() => {
    if (isVisible && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDelay, onClose]);

  // Get localized product name
  const getLocalizedName = (item: CartItem) => {
    switch (i18n.language) {
      case 'en':
        return item.name_en || item.name;
      case 'de':
        return item.name_de || item.name;
      case 'hr':
        return item.name_hr || item.name;
      default:
        return item.name;
    }
  };

  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  if (!isVisible || !item) return null;

  return (
    <>
      {/* Desktop Toast Notification */}
      <div className="hidden md:block fixed top-4 right-4 z-50 animate-slide-in-right">
        <div className="bg-white border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            {/* Product Image */}
            <img 
              src={item.image_url} 
              alt={getLocalizedName(item)}
              className="w-12 h-12 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=P';
              }}
            />
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  {t('cart.itemAdded', 'Dodano v košarico')}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {getLocalizedName(item)}
              </p>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={handleViewCart}
                  className="flex items-center space-x-1 bg-amber-600 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('cart.viewCart', 'Poglej košarico')} ({cartCount})</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Notification */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white border-t border-gray-200 shadow-lg">
          {/* Swipe indicator */}
          <div className="flex justify-center py-2">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="px-4 pb-4">
            <div className="flex items-center space-x-3 mb-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900">
                {getLocalizedName(item)} {t('cart.addedToCart', 'dodano v košarico')}
              </span>
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={item.image_url} 
                  alt={getLocalizedName(item)}
                  className="w-12 h-12 object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=P';
                  }}
                />
                <div>
                  <p className="text-sm text-gray-600">
                    {cartCount} {cartCount === 1 ? t('cart.item', 'izdelek') : t('cart.items', 'izdelkov')} • €{cartTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  {t('common.continue', 'Nadaljuj')}
                </button>
                <button
                  onClick={handleViewCart}
                  className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md text-sm hover:bg-amber-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('cart.viewCart', 'Poglej košarico')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
