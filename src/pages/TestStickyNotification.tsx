import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Check, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface StickyNotificationProps {
  product: Product;
  isVisible: boolean;
  onClose: () => void;
  cartCount: number;
  cartTotal: number;
}

const StickyNotification: React.FC<StickyNotificationProps> = ({ 
  product, 
  isVisible, 
  onClose, 
  cartCount,
  cartTotal 
}) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t border-gray-200 shadow-lg">
        {/* Swipe indicator */}
        <div className="flex justify-center py-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-3 mb-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">
              {product.name} {t('cart.addedToCart', 'added to cart')}
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
                src={product.image} 
                alt={product.name}
                className="w-12 h-12 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=P';
                }}
              />
              <div>
                <p className="text-sm text-gray-600">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} • €{cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                {t('common.continue', 'Continue')}
              </button>
              <button
                onClick={() => {/* Navigate to cart */}}
                className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-md text-sm hover:bg-amber-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('cart.viewCart', 'View Cart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestStickyNotification: React.FC = () => {
  const { t } = useTranslation();
  const [showNotification, setShowNotification] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Fižol (1kg)',
      price: 6.00,
      image: '/images/fizol/fizol-1kg.jpg'
    },
    {
      id: '2', 
      name: 'Prosena kaša (500g)',
      price: 4.50,
      image: '/images/prosena-kasa/prosena-kasa-500g.jpg'
    },
    {
      id: '3',
      name: 'Mesano (250g)',
      price: 3.20,
      image: '/images/mesano/mesano-250g.jpg'
    }
  ];

  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0]);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setCartCount(prev => prev + 1);
    setCartTotal(prev => prev + product.price);
    setShowNotification(true);
    
    // Auto-hide after 5 seconds (longer for mobile)
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          📱 Sticky Bottom Notification Test (Mobile Style)
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Test Products</h2>
          <p className="text-gray-600 text-sm mb-4">
            Click "Add to Cart" to see the sticky notification appear at the bottom.
          </p>
          
          <div className="space-y-4">
            {sampleProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Product';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-amber-600 font-semibold">€{product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-amber-600 text-white py-2 px-3 rounded-md hover:bg-amber-700 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-20">
          <h3 className="text-base font-semibold text-blue-900 mb-2">
            Sticky Notification Features:
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Appears at bottom of screen</li>
            <li>• Full width for easy tapping</li>
            <li>• Shows cart count and total</li>
            <li>• Swipe indicator for dismissal</li>
            <li>• Large touch targets</li>
            <li>• Auto-dismisses after 5 seconds</li>
          </ul>
        </div>
      </div>

      {/* Sticky Notification */}
      <StickyNotification
        product={selectedProduct}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        cartCount={cartCount}
        cartTotal={cartTotal}
      />

      {/* Custom CSS for animation */}
      <style jsx>{`
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
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
