import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ToastNotificationProps {
  product: Product;
  isVisible: boolean;
  onClose: () => void;
  cartCount: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  product, 
  isVisible, 
  onClose, 
  cartCount 
}) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          {/* Product Image */}
          <img 
            src={product.image} 
            alt={product.name}
            className="w-12 h-12 object-cover rounded-md"
          />
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                {t('cart.itemAdded', 'Added to cart')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {product.name}
            </p>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => {/* Navigate to cart */}}
                className="flex items-center space-x-1 bg-amber-600 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('cart.viewCart', 'View Cart')} ({cartCount})</span>
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
  );
};

export const TestToastNotification: React.FC = () => {
  const { t } = useTranslation();
  const [showNotification, setShowNotification] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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
    setShowNotification(true);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🍞 Toast Notification Test (Desktop Style)
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Products</h2>
          <p className="text-gray-600 mb-6">
            Click "Add to Cart" to see the toast notification appear in the top-right corner.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=Product';
                  }}
                />
                <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                <p className="text-amber-600 font-semibold mb-3">€{product.price.toFixed(2)}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Toast Notification Features:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Appears in top-right corner</li>
            <li>• Shows product image and name</li>
            <li>• Includes "View Cart" button with count</li>
            <li>• Auto-dismisses after 4 seconds</li>
            <li>• Can be manually closed with X button</li>
            <li>• Smooth slide-in animation</li>
          </ul>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastNotification
        product={selectedProduct}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        cartCount={cartCount}
      />

      {/* Custom CSS for animation */}
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
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
