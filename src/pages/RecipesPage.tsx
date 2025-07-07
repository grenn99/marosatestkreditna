import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RecipeCard } from '../components/RecipeCard';
import { sampleRecipes, getRecipesByProductId } from '../data/sampleRecipes';
import { RecipeFilters } from '../components/RecipeFilters';

export function RecipesPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const langParam = searchParams.get('lang');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Filter recipes based on selected product
  const filteredRecipes = selectedProductId
    ? getRecipesByProductId(selectedProductId)
    : sampleRecipes;

  useEffect(() => {
    if (langParam && langParam !== i18n.language) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-6 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-brown-800">{t('recipes.pageTitle', 'Recipes')}</h1>
        <p className="text-gray-600 mb-8">
          {t('recipes.pageDescription', 'Discover delicious recipes using our farm products. From traditional Slovenian dishes to modern creations, find inspiration for your next meal.')}
        </p>

        {/* Product Filter Buttons */}
        <RecipeFilters
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
        />

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 mb-12">
            {t('recipes.noRecipesFound', 'No recipes found for the selected product.')}
          </div>
        )}
      </div>
    </div>
  );
}
