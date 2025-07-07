import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ImageModal } from './ImageModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { supabase } from '../lib/supabaseClient';
import { recipes } from './data/recipes';
import { AddToCart } from './components/AddToCart';

export function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const langParam = searchParams.get('lang');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackageOptionId, setSelectedPackageOptionId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (langParam && langParam !== i18n.language) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error("Product ID is missing.");
        }

        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
          throw new Error("Invalid Product ID.");
        }

        const language = i18n.language;
        const nameColumn = `name_${language}`;
        const descriptionColumn = `description_${language}`;

        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            created_at,
            ${nameColumn},
            ${descriptionColumn},
            price,
            package_options,
            image_url,
            stock_quantity,
            category,
            name,
            description
          `)
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProduct(data);
          console.log("Product data: ", data);
        } else {
          setError(t('productDetail.notFound', 'Product not found.'));
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(t('productDetail.fetchError', 'Could not load product details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, i18n.language, t]);

  const getPhoneNumber = () => {
    switch (i18n.language) {
      case 'sl':
        return '031 627 364';
      default:
        return '+386 31 627 364';
    }
  };

  const getTranslatedPhoneNumberLabel = () => {
    return i18n.language === 'sl' ? 'Telefon' : 'Phone';
  };

  if (loading) {
    return <div>{t('productDetail.loading', 'Loading product details...')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('products.notFound')}</h2>
          <Link to={`/?lang=${i18n.language}`} className="text-brown-600 hover:text-brown-700">
            {t('products.backToHome')}</Link>
        </div>
      </div>
    );
  }

  const translatedName = product[`name_${i18n.language}`] || product.name;
  const translatedDescription = product[`description_${i18n.language}`] || product.description;

  const galleryImages = [];
  const productRecipes = recipes.filter(recipe => recipe.productId === product.id);

  const getTranslatedRecipeContent = (recipe) => {
    if (i18n.language === 'sl') {
      return {
        title: recipe.title,
        description: recipe.description,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
      };
    }

    const translation = recipe.translations?.[i18n.language];
    if (translation) {
      return translation;
    }

    return {
      title: recipe.title,
      description: recipe.description,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    };
  };

  return (
    <>
      <div className="bg-brown-900">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4 lg:px-12">
          <Link to={`/?lang=${i18n.language}`} className="hover:opacity-90 transition-opacity">
            <img
              src="https://i.ibb.co/8D2qrWnG/logo.png"
              alt="Kmetija Maroša"
              className="w-[120px] h-[105px] sm:w-[160px] sm:h-[140px] lg:w-[200px] lg:h-[175px]"
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="pt-6 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <Link to={`/?lang=${i18n.language}`} className="inline-flex items-center text-brown-600 hover:text-brown-700 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('productDetail.backToProducts')}</Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <img
                src={product.image_url}
                className="w-full rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                alt={product.name}
                onClick={() => setSelectedImage(product.image_url)}
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-4">{translatedName}</h1>
              <p className="text-gray-600 mb-8">{translatedDescription}</p>

              <div className="bg-brown-50 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">{t('productDetail.packagingAndPrices')}</h2>
                <div className="space-y-4">
                  {product.package_options && product.package_options.length > 0 ? (
                    product.package_options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{option.weight ? `${option.weight}:` : ''}</span>
                        <span>{option.price} €</span>
                        <button
                          className="bg-brown-300 hover:bg-brown-400 text-brown-800 font-bold py-2 px-4 rounded"
                          onClick={() => setSelectedPackageOptionId(option.id)}
                        >
                          {t('productDetail.selectOption', 'Select')}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>{t('productDetail.noOptions')}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
                  {t('productDetail.quantity', 'Quantity')}:
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>

              <div className="bg-brown-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{t('productDetail.order.title')}</h2>
                <p className="text-gray-600 mb-4">
                  {t('productDetail.order.description')}
                </p>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Email: <a href="mailto:kmetija.marosa@gmail.com">kmetija.marosa@gmail.com</a></li>
                  <li>{getTranslatedPhoneNumberLabel()}: {getPhoneNumber()}</li>
                </ul>
              </div>

              {selectedPackageOptionId !== null && (
                <AddToCart productId={product.id} packageOptionId={selectedPackageOptionId} quantity={quantity} />
              )}
            </div>
          </div>

          {galleryImages.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-brown-800">{t('products.gallery')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${t('products.image')} ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedImage && (
            <ImageModal
              imageUrl={selectedImage}
              alt={t('products.fullSizeImage')}
              onClose={() => setSelectedImage(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}
