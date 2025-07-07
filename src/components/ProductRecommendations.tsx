import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getPersonalizedRecommendations, loadUserProfile } from '../utils/recommendations';
import { useAuth } from '../context/AuthContext';
import ResponsiveImage from './ResponsiveImage';

interface Product {
  id: string | number;
  name: string;
  category_id?: string | number;
  tags?: string[];
  price?: number;
  image_url?: string;
  slug?: string;
}

interface ProductRecommendationsProps {
  title?: string;
  products: Product[];
  currentProductId?: string | number;
  limit?: number;
  className?: string;
}

/**
 * Component to display personalized product recommendations
 */
export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  title,
  products,
  currentProductId,
  limit = 4,
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    // Filter out current product if provided
    const availableProducts = currentProductId 
      ? products.filter(p => p.id !== currentProductId)
      : products;

    if (user) {
      // Get personalized recommendations for logged-in users
      const userProfile = loadUserProfile(user.id);
      const personalizedRecommendations = getPersonalizedRecommendations(
        availableProducts,
        userProfile,
        limit
      );
      setRecommendations(personalizedRecommendations);
    } else {
      // For non-logged in users, just show random products
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, limit));
    }
  }, [products, currentProductId, user, limit]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-brown-800 mb-6">
        {title || t('recommendations.forYou', 'Recommended For You')}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product, index) => (
          <Link 
            key={product.id} 
            to={`/products/${product.slug || product.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <ResponsiveImage
                  src={product.image_url || ''}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  index={index}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 group-hover:text-brown-600 transition-colors">
                  {product.name}
                </h3>
                {product.price !== undefined && (
                  <p className="mt-2 text-brown-600 font-medium">
                    €{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
