import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getImageUrl } from '../utils/imageUtils';

interface GiftProduct {
  id: number;
  name: string;
  name_en?: string;
  name_de?: string;
  name_hr?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  description_hr?: string;
  image_url?: string;
  price: number;
  package_options: any;
}

interface ProductGiftSelectorProps {
  onSelect: (productId: number | null, packageOptionId: string | null) => void;
}

export function ProductGiftSelector({ onSelect }: ProductGiftSelectorProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedPackageOption, setSelectedPackageOption] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGiftOptions, setShowGiftOptions] = useState(false);

  useEffect(() => {
    fetchGiftProducts();
  }, []);

  const fetchGiftProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('isActive', true)
        .order('name');

      if (error) throw error;

      // Process the products to ensure package_options is parsed
      const processedProducts = (data || []).map(product => ({
        ...product,
        package_options: typeof product.package_options === 'string'
          ? JSON.parse(product.package_options)
          : product.package_options
      }));

      setGiftProducts(processedProducts);
    } catch (err: any) {
      console.error('Error fetching gift products:', err);
      setError(t('checkout.giftProducts.fetchError', 'Failed to load gift products'));
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: number | null) => {
    if (productId === selectedProduct) {
      // If clicking the same product, toggle selection off
      setSelectedProduct(null);
      setSelectedPackageOption(null);
      onSelect(null, null);
    } else {
      setSelectedProduct(productId);

      // If a product is selected, automatically select the first package option
      if (productId !== null) {
        const product = giftProducts.find(p => p.id === productId);
        if (product && Array.isArray(product.package_options) && product.package_options.length > 0) {
          const firstOption = product.package_options[0];
          setSelectedPackageOption(firstOption.uniq_id);
          onSelect(productId, firstOption.uniq_id);
        } else {
          setSelectedPackageOption(null);
          onSelect(productId, null);
        }
      }
    }
  };

  const handlePackageOptionSelect = (packageOptionId: string) => {
    setSelectedPackageOption(packageOptionId);
    onSelect(selectedProduct, packageOptionId);
  };

  const getTranslatedName = (product: GiftProduct) => {
    const lang = i18n.language;
    if (lang === 'en' && product.name_en) return product.name_en;
    if (lang === 'de' && product.name_de) return product.name_de;
    if (lang === 'hr' && product.name_hr) return product.name_hr;
    return product.name;
  };

  const getTranslatedDescription = (product: GiftProduct) => {
    const lang = i18n.language;
    if (lang === 'en' && product.description_en) return product.description_en;
    if (lang === 'de' && product.description_de) return product.description_de;
    if (lang === 'hr' && product.description_hr) return product.description_hr;
    return product.description || '';
  };

  const getPackageOptionPrice = (product: GiftProduct, packageOptionId: string) => {
    if (!Array.isArray(product.package_options)) return 0;

    const option = product.package_options.find((opt: any) => opt.uniq_id === packageOptionId);
    return option ? option.price : 0;
  };

  const getPackageOptionDescription = (product: GiftProduct, packageOptionId: string) => {
    if (!Array.isArray(product.package_options)) return '';

    const option = product.package_options.find((opt: any) => opt.uniq_id === packageOptionId);
    if (!option) return '';

    return option.description || `${option.weight}${option.unit || ''}`;
  };

  // Filter products based on search term
  const filteredProducts = giftProducts.filter(product =>
    getTranslatedName(product).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the selected product details
  const selectedProductDetails = selectedProduct
    ? giftProducts.find(p => p.id === selectedProduct)
    : null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Gift className="h-5 w-5 text-amber-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">
          {t('checkout.giftProducts.title', 'Pošlji darilo prijatelju')}
        </h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {t('checkout.giftProducts.description', 'Izberite izdelek, ki ga želite podariti.')}
        </p>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="show-gift-options"
          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          checked={showGiftOptions}
          onChange={() => {
            setShowGiftOptions(!showGiftOptions);
            if (!showGiftOptions) {
              // Reset selections when turning off
              setSelectedProduct(null);
              setSelectedPackageOption(null);
              onSelect(null, null);
            }
          }}
        />
        <label htmlFor="show-gift-options" className="ml-2 block text-sm text-gray-700">
          {t('checkout.giftProducts.addGift', 'Dodaj darilo k naročilu')}
        </label>
      </div>

      {showGiftOptions && (
        <>
          {/* Search input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              placeholder={t('checkout.giftProducts.search', 'Išči izdelke...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-4 text-center text-gray-500">
              {t('checkout.giftProducts.loading', 'Nalaganje izdelkov...')}
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500 hidden">
              {error}
            </div>
          ) : (
            <>
              {/* Product grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`border rounded-md p-2 cursor-pointer transition-colors ${
                      selectedProduct === product.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <div className="aspect-square overflow-hidden rounded-md mb-2">
                      <img
                        src={getImageUrl(product.image_url || '') || '/images/placeholder-product.jpg'}
                        alt={getTranslatedName(product)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm font-medium truncate">{getTranslatedName(product)}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {Array.isArray(product.package_options) && product.package_options.length > 0
                        ? `${product.package_options[0].price.toFixed(2)} €`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Package options for selected product */}
              {selectedProductDetails && Array.isArray(selectedProductDetails.package_options) && selectedProductDetails.package_options.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.giftProducts.selectOption', 'Izberite možnost pakiranja:')}
                  </h4>
                  <div className="space-y-2">
                    {selectedProductDetails.package_options.map((option: any) => (
                      <div
                        key={option.uniq_id}
                        className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
                          selectedPackageOption === option.uniq_id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                        onClick={() => handlePackageOptionSelect(option.uniq_id)}
                      >
                        <span className="text-sm">
                          {option.description || `${option.weight}${option.unit || ''}`}
                        </span>
                        <span className="text-sm font-medium">{option.price.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected product summary */}
              {selectedProductDetails && selectedPackageOption && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">
                    {t('checkout.giftProducts.selectedGift', 'Izbrano darilo:')}
                  </h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                      <img
                        src={getImageUrl(selectedProductDetails.image_url || '') || '/images/placeholder-product.jpg'}
                        alt={getTranslatedName(selectedProductDetails)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{getTranslatedName(selectedProductDetails)}</div>
                      <div className="text-xs text-gray-600">
                        {getPackageOptionDescription(selectedProductDetails, selectedPackageOption)}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {getPackageOptionPrice(selectedProductDetails, selectedPackageOption).toFixed(2)} €
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
