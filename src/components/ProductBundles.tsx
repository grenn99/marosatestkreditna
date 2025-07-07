import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Image } from './Image';

interface ProductBundlesProps {
  productId: number;
  category?: string;
}

interface Bundle {
  id: string;
  name: string;
  products: {
    id: number;
    packageOptionId: string;
    quantity: number;
  }[];
  discountPercent: number;
  totalPrice: number;
  originalPrice: number;
}

export function ProductBundles({ productId, category }: ProductBundlesProps) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundleProducts, setBundleProducts] = useState<Record<number, Product>>({});
  const [addingBundle, setAddingBundle] = useState<string | null>(null);
  const [bundleAdded, setBundleAdded] = useState<string | null>(null);

  // Fetch related products that could be bundled with this product
  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For now, we'll create mock bundles based on the product category
        // In a real implementation, you would fetch actual bundle data from the database
        
        // First, fetch related products in the same category
        const { data: relatedProducts, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', productId)
          .limit(4);
          
        if (error) throw error;
        
        if (!relatedProducts || relatedProducts.length === 0) {
          setLoading(false);
          return; // No related products to create bundles with
        }
        
        // Store the products for reference
        const productsMap: Record<number, Product> = {};
        relatedProducts.forEach(product => {
          productsMap[product.id] = product;
        });
        setBundleProducts(productsMap);
        
        // Create mock bundles
        const mockBundles: Bundle[] = [];
        
        // Bundle 1: Current product + 1 related product
        if (relatedProducts.length >= 1) {
          const relatedProduct = relatedProducts[0];
          const relatedPackageOption = JSON.parse(relatedProduct.package_options)[0];
          
          // Calculate prices
          const originalPrice = 
            getProductPrice(productId) + 
            relatedPackageOption.price;
          
          const discountPercent = 10; // 10% discount
          const totalPrice = originalPrice * (1 - discountPercent / 100);
          
          mockBundles.push({
            id: `bundle-${productId}-${relatedProduct.id}`,
            name: t('bundles.pairBundle', 'Perfect Pair'),
            products: [
              {
                id: productId,
                packageOptionId: getProductPackageOptionId(productId),
                quantity: 1
              },
              {
                id: relatedProduct.id,
                packageOptionId: relatedPackageOption.uniq_id,
                quantity: 1
              }
            ],
            discountPercent,
            totalPrice,
            originalPrice
          });
        }
        
        // Bundle 2: Current product + 2 related products
        if (relatedProducts.length >= 2) {
          const relatedProduct1 = relatedProducts[0];
          const relatedProduct2 = relatedProducts[1];
          const relatedPackageOption1 = JSON.parse(relatedProduct1.package_options)[0];
          const relatedPackageOption2 = JSON.parse(relatedProduct2.package_options)[0];
          
          // Calculate prices
          const originalPrice = 
            getProductPrice(productId) + 
            relatedPackageOption1.price +
            relatedPackageOption2.price;
          
          const discountPercent = 15; // 15% discount
          const totalPrice = originalPrice * (1 - discountPercent / 100);
          
          mockBundles.push({
            id: `bundle-${productId}-${relatedProduct1.id}-${relatedProduct2.id}`,
            name: t('bundles.tripleBundle', 'Triple Value Bundle'),
            products: [
              {
                id: productId,
                packageOptionId: getProductPackageOptionId(productId),
                quantity: 1
              },
              {
                id: relatedProduct1.id,
                packageOptionId: relatedPackageOption1.uniq_id,
                quantity: 1
              },
              {
                id: relatedProduct2.id,
                packageOptionId: relatedPackageOption2.uniq_id,
                quantity: 1
              }
            ],
            discountPercent,
            totalPrice,
            originalPrice
          });
        }
        
        setBundles(mockBundles);
      } catch (err) {
        console.error('Error fetching product bundles:', err);
        setError(t('bundles.error', 'Could not load bundle offers.'));
      } finally {
        setLoading(false);
      }
    };
    
    if (productId && category) {
      fetchBundles();
    }
  }, [productId, category, t]);
  
  // Helper function to get the first package option ID for a product
  const getProductPackageOptionId = (id: number): string => {
    // For the current product, we'll assume the first package option
    return "1"; // This should be replaced with actual logic to get the package option ID
  };
  
  // Helper function to get the price of a product
  const getProductPrice = (id: number): number => {
    // For the current product, we'll assume a fixed price
    return 10.99; // This should be replaced with actual logic to get the product price
  };
  
  // Handle adding a bundle to cart
  const handleAddBundle = async (bundle: Bundle) => {
    setAddingBundle(bundle.id);
    
    try {
      // Add each product in the bundle to the cart
      for (const product of bundle.products) {
        await addToCart(product.id, product.packageOptionId, product.quantity);
      }
      
      // Show success state
      setBundleAdded(bundle.id);
      setTimeout(() => setBundleAdded(null), 3000);
    } catch (err) {
      console.error('Error adding bundle to cart:', err);
    } finally {
      setAddingBundle(null);
    }
  };
  
  if (loading) return null;
  if (error) return null;
  if (bundles.length === 0) return null;
  
  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-xl font-bold text-brown-800 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-amber-600" />
        {t('bundles.title', 'Bundle and Save')}
      </h3>
      
      <div className="space-y-4">
        {bundles.map(bundle => (
          <div 
            key={bundle.id} 
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-brown-800">{bundle.name}</h4>
                <div className="flex items-center gap-1 text-sm text-green-600 font-medium mt-1">
                  <Check className="w-4 h-4" />
                  {t('bundles.savePercent', 'Save {{percent}}%', { percent: bundle.discountPercent })}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  {bundle.products.map(product => (
                    <div key={product.id} className="w-12 h-12 relative">
                      <Image
                        src={bundleProducts[product.id]?.image_url || ''}
                        alt={bundleProducts[product.id]?.name || ''}
                        className="w-full h-full object-cover rounded-md"
                        fallbackSrc="/images/placeholder-product.svg"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 line-through text-sm">
                    {bundle.originalPrice.toFixed(2)} €
                  </span>
                  <span className="font-bold text-brown-800">
                    {bundle.totalPrice.toFixed(2)} €
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddBundle(bundle)}
                  disabled={addingBundle === bundle.id}
                  className={`mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    bundleAdded === bundle.id
                      ? 'bg-green-600 text-white'
                      : 'bg-brown-600 hover:bg-brown-700 text-white'
                  }`}
                >
                  {bundleAdded === bundle.id
                    ? t('bundles.added', 'Added to Cart!')
                    : addingBundle === bundle.id
                    ? t('bundles.adding', 'Adding...')
                    : t('bundles.addToCart', 'Add Bundle to Cart')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
