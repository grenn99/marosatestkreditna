import React from 'react';
import { useTranslation } from 'react-i18next';

interface RecipeFiltersProps {
  selectedProductId: number | null;
  onSelectProduct: (productId: number | null) => void;
}

// Product ID to name mapping
const productMap: Record<number, { name: string, name_en: string }> = {
  1: { name: 'Bučno olje', name_en: 'Pumpkin Seed Oil' },
  2: { name: 'Bučna semena', name_en: 'Pumpkin Seeds' },
  5: { name: 'Melisa', name_en: 'Lemon Balm' },
  6: { name: 'Poprova meta', name_en: 'Peppermint' },
  7: { name: 'Ameriški slamnik', name_en: 'Echinacea' },
  8: { name: 'Kamilice', name_en: 'Chamomile' },
  10: { name: 'Ajdova kaša', name_en: 'Buckwheat Groats' },
  11: { name: 'Prosena kaša', name_en: 'Millet Groats' }
};

export function RecipeFilters({ selectedProductId, onSelectProduct }: RecipeFiltersProps) {
  const { t, i18n } = useTranslation();
  
  const getTranslatedName = (productId: number) => {
    const product = productMap[productId];
    if (!product) return `Product ${productId}`;
    
    return i18n.language === 'en' ? product.name_en : product.name;
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3 text-brown-800">{t('recipes.filterByProduct', 'Filter by Product')}</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectProduct(null)}
          className={`px-4 py-2 rounded-full transition-colors ${
            selectedProductId === null
              ? 'bg-brown-600 text-white'
              : 'bg-brown-100 text-brown-800 hover:bg-brown-200'
          }`}
        >
          {t('recipes.allRecipes', 'All Recipes')}
        </button>
        
        {Object.keys(productMap).map((idStr) => {
          const id = parseInt(idStr, 10);
          return (
            <button
              key={id}
              onClick={() => onSelectProduct(id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedProductId === id
                  ? 'bg-brown-600 text-white'
                  : 'bg-brown-100 text-brown-800 hover:bg-brown-200'
              }`}
            >
              {getTranslatedName(id)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
