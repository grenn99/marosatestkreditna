import React from 'react';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../types';
import { Link } from 'react-router-dom';
import { Clock, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  compact?: boolean;
}

export function RecipeCard({ recipe, compact = false }: RecipeCardProps) {
  const { t, i18n } = useTranslation();

  // Get translated title based on current language
  const getTranslatedTitle = () => {
    const lang = i18n.language;
    if (lang === 'en' && recipe.title_en) return recipe.title_en;
    if (lang === 'de' && recipe.title_de) return recipe.title_de;
    if (lang === 'hr' && recipe.title_hr) return recipe.title_hr;
    if (lang === 'sl' && recipe.title_sl) return recipe.title_sl;
    return recipe.title; // Default to base title
  };

  const translatedTitle = getTranslatedTitle();

  // Compact card for product pages
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.image_url}
            alt={translatedTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/recipe-placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <h3 className="text-white font-bold p-4 text-lg">{translatedTitle}</h3>
          </div>
        </div>
        <div className="p-3 flex justify-between items-center">
          {recipe.prepTime && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{recipe.prepTime}</span>
            </div>
          )}
          <Link
            to={`/recipes/${recipe.id}?lang=${i18n.language}`}
            className="text-brown-600 hover:text-brown-800 text-sm font-medium"
          >
            {t('recipes.viewRecipe', 'View Recipe')}
          </Link>
        </div>
      </div>
    );
  }

  // Full card for recipes page
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64 overflow-hidden">
        <img
          src={recipe.image_url}
          alt={translatedTitle}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/recipe-placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <h3 className="text-white font-bold p-6 text-xl">{translatedTitle}</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          {recipe.prepTime && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>{recipe.prepTime}</span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center text-gray-600">
              <ChefHat className="w-5 h-5 mr-2" />
              <span>{recipe.difficulty}</span>
            </div>
          )}
        </div>
        <Link
          to={`/recipes/${recipe.id}?lang=${i18n.language}`}
          className="block w-full text-center bg-brown-600 text-white py-2 px-4 rounded-md hover:bg-brown-700 transition-colors"
        >
          {t('recipes.viewRecipe', 'View Recipe')}
        </Link>
      </div>
    </div>
  );
}
