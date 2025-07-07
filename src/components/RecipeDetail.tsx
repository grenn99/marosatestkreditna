import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../types';
import { sampleRecipes } from '../data/sampleRecipes';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const langParam = searchParams.get('lang');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (langParam && langParam !== i18n.language) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  // Scroll to top when component mounts or recipe ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchRecipe = () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error("Recipe ID is missing.");
        }

        const recipeId = parseInt(id, 10);
        if (isNaN(recipeId)) {
          throw new Error("Invalid Recipe ID.");
        }

        const foundRecipe = sampleRecipes.find(r => r.id === recipeId);

        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          setError(t('recipes.notFound', 'Recipe not found.'));
          setRecipe(null);
        }
      } catch (err: any) {
        console.error("Error fetching recipe:", err);
        setError(t('recipes.fetchError', 'Could not load recipe details.'));
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, t]);

  // Get translated content based on current language
  const getTranslatedContent = (
    base: string | undefined,
    en?: string,
    de?: string,
    hr?: string,
    sl?: string
  ) => {
    const lang = i18n.language;
    if (lang === 'en' && en) return en;
    if (lang === 'de' && de) return de;
    if (lang === 'hr' && hr) return hr;
    if (lang === 'sl' && sl) return sl;
    return base || ''; // Default to base content
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('recipes.loading', 'Loading recipe...')}</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-red-600">{error}</h2>
        <Link to={`/?lang=${i18n.language}`} className="text-brown-600 hover:text-brown-700">
          {t('recipes.backToHome', 'Back to Home')}
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('recipes.notFound', 'Recipe not found')}</h2>
          <Link to={`/?lang=${i18n.language}`} className="text-brown-600 hover:text-brown-700">
            {t('recipes.backToHome', 'Back to Home')}
          </Link>
        </div>
      </div>
    );
  }

  const translatedTitle = getTranslatedContent(
    recipe.title,
    recipe.title_en,
    recipe.title_de,
    recipe.title_hr,
    recipe.title_sl
  );

  const translatedIngredients = i18n.language === 'en' && recipe.ingredients_en
    ? recipe.ingredients_en
    : i18n.language === 'de' && recipe.ingredients_de
    ? recipe.ingredients_de
    : i18n.language === 'hr' && recipe.ingredients_hr
    ? recipe.ingredients_hr
    : i18n.language === 'sl' && recipe.ingredients_sl
    ? recipe.ingredients_sl
    : recipe.ingredients;

  const translatedInstructions = i18n.language === 'en' && recipe.instructions_en
    ? recipe.instructions_en
    : i18n.language === 'de' && recipe.instructions_de
    ? recipe.instructions_de
    : i18n.language === 'hr' && recipe.instructions_hr
    ? recipe.instructions_hr
    : i18n.language === 'sl' && recipe.instructions_sl
    ? recipe.instructions_sl
    : recipe.instructions;

  return (
    <div className="pt-6 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to={`/recipes?lang=${i18n.language}`} className="inline-flex items-center text-brown-600 hover:text-brown-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('recipes.backToRecipes', 'Back to Recipes')}
        </Link>

        {/* Recipe Header */}
        <div className="relative h-80 rounded-xl overflow-hidden mb-8">
          <img
            src={recipe.image_url}
            alt={translatedTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/recipe-placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-8 w-full">
              <h1 className="text-4xl font-bold text-white mb-4">{translatedTitle}</h1>
              <div className="flex flex-wrap gap-4">
                {recipe.prepTime && (
                  <div className="flex items-center text-white bg-black/30 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{recipe.prepTime}</span>
                  </div>
                )}
                {recipe.cookTime && (
                  <div className="flex items-center text-white bg-black/30 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{recipe.cookTime}</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center text-white bg-black/30 px-3 py-1 rounded-full">
                    <ChefHat className="w-4 h-4 mr-2" />
                    <span>{recipe.difficulty}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <div className="bg-brown-50 rounded-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4 text-brown-800">{t('recipes.ingredients', 'Ingredients')}</h2>
              <ul className="space-y-2">
                {translatedIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-brown-500 mt-2 mr-3 flex-shrink-0"></span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            {/* Chef Information - Check if first instruction contains chef info */}
            {translatedInstructions.length > 0 && translatedInstructions[0].includes('Chef') && (
              <div className="bg-brown-50 p-5 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2 text-brown-800">{t('recipes.chefInfo', 'About the Chef')}</h3>
                <p>{translatedInstructions[0]}</p>
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-brown-800">{t('recipes.instructions', 'Instructions')}</h2>
            <ol className="space-y-6">
              {/* Pre-calculate the starting index to avoid conditional hooks */}
              {translatedInstructions
                .slice(translatedInstructions.length > 0 && translatedInstructions[0].includes('Chef') ? 1 : 0)
                .map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brown-600 text-white font-bold mr-4 flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="pt-1">{instruction}</p>
                  </li>
                ))}
            </ol>
          </div>
        </div>

        {/* Related Products Section */}
        {recipe.relatedProductIds && recipe.relatedProductIds.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-brown-800">{t('recipes.relatedProducts', 'Related Products')}</h2>
            <p className="text-gray-600 mb-4">{t('recipes.relatedProductsDescription', 'Products used in this recipe:')}</p>
            <div className="flex flex-wrap gap-2">
              {recipe.relatedProductIds.map(productId => (
                <Link
                  key={productId}
                  to={`/products/${productId}?lang=${i18n.language}`}
                  className="inline-block bg-brown-100 hover:bg-brown-200 text-brown-800 px-4 py-2 rounded-full transition-colors"
                >
                  {productId === 1 ? 'Bučno olje' :
                   productId === 2 ? 'Bučna semena' :
                   productId === 5 ? 'Melisa' :
                   productId === 6 ? 'Poprova meta' :
                   productId === 7 ? 'Ameriški slamnik' :
                   productId === 8 ? 'Kamilice' :
                   productId === 10 ? 'Ajdova kaša' :
                   productId === 11 ? 'Prosena kaša' :
                   `Izdelek ${productId}`}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
