import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

interface AddToCartProps {
  productId: number;
  packageOptionId: string;
  quantity: number; // Re-added quantity prop
}

export const AddToCart: React.FC<AddToCartProps> = ({ productId, packageOptionId, quantity }) => {
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    // Use the quantity passed via props
    const quantityToAdd = quantity > 0 ? quantity : 1; // Ensure at least 1 is added
    console.log("AddToCart button clicked");
    console.log("Adding to cart - productId:", productId, "packageOptionId:", packageOptionId, "quantity:", quantityToAdd);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await addToCart(productId, packageOptionId, quantityToAdd);
      
      if (!result.success && result.message) {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(t('addToCart.error', 'Error adding to cart'));
    } finally {
      setIsLoading(false);
    }
  };

  // Disable button if quantity is not positive or if loading
  const isDisabled = quantity <= 0 || isLoading;

  return (
    <div className="flex flex-col">
      <button
        className={`bg-brown-500 text-white font-bold py-2 px-4 rounded ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-brown-700'
        }`}
        onClick={handleAddToCart}
        disabled={isDisabled} // Add disabled attribute
      >
        {isLoading ? t('addToCart.adding', 'Adding...') : t('addToCartButton', 'Add to Cart')}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
