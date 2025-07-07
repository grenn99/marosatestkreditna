import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, AlertCircle, Loader, Mail } from 'lucide-react';
import { unsubscribeFromNewsletter, updateSubscriberPreferences } from '../utils/newsletterService';

export function UnsubscribePage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const langParam = searchParams.get('lang');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'preferences'>('loading');
  const [message, setMessage] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [preferences, setPreferences] = useState({
    productUpdates: true,
    promotions: true,
    recipes: true
  });
  const [savingPreferences, setSavingPreferences] = useState(false);
  
  // Set language from URL parameter if provided
  useEffect(() => {
    if (langParam && langParam !== i18n.language) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);
  
  // Check token when component mounts
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('newsletter.unsubscribe.noToken', 'No unsubscribe token provided'));
        return;
      }
      
      // Just set to preferences state initially
      setStatus('preferences');
    };
    
    checkToken();
  }, [token, t]);
  
  // Handle unsubscribe button click
  const handleUnsubscribe = async () => {
    if (!token) return;
    
    setStatus('loading');
    
    try {
      const result = await unsubscribeFromNewsletter(token);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        if (result.email) {
          setSubscriberEmail(result.email);
        }
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatus('error');
      setMessage(t('newsletter.unsubscribe.error', 'An error occurred while processing your request'));
    }
  };
  
  // Handle preferences update
  const handleUpdatePreferences = async () => {
    if (!token) return;
    
    setSavingPreferences(true);
    
    try {
      const result = await updateSubscriberPreferences(token, preferences);
      
      if (result.success) {
        setMessage(result.message);
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage(t('newsletter.preferences.error', 'An error occurred while updating your preferences'));
    } finally {
      setSavingPreferences(false);
    }
  };
  
  // Handle preference checkbox change
  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <img src="/logo.svg" alt="Kmetija Maroša" className="h-16" />
            </div>
            
            <h1 className="text-2xl font-bold text-center text-brown-800 mb-6">
              {t('newsletter.unsubscribe.title', 'Newsletter Preferences')}
            </h1>
            
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="w-12 h-12 text-brown-600 animate-spin mb-4" />
                <p className="text-gray-600">
                  {t('newsletter.unsubscribe.loading', 'Processing your request...')}
                </p>
              </div>
            )}
            
            {status === 'preferences' && (
              <div className="py-4">
                <p className="text-gray-600 mb-6">
                  {t('newsletter.preferences.intro', 'You can update your newsletter preferences or unsubscribe completely below.')}
                </p>
                
                {message && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-6">
                    <p className="text-green-700 text-sm">{message}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-brown-800 mb-3">
                    {t('newsletter.preferences.title', 'Email Preferences')}
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="productUpdates"
                        checked={preferences.productUpdates}
                        onChange={() => handlePreferenceChange('productUpdates')}
                        className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                      />
                      <label htmlFor="productUpdates" className="ml-2 block text-sm text-gray-700">
                        {t('newsletter.preferences.productUpdates', 'Product updates and new arrivals')}
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="promotions"
                        checked={preferences.promotions}
                        onChange={() => handlePreferenceChange('promotions')}
                        className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                      />
                      <label htmlFor="promotions" className="ml-2 block text-sm text-gray-700">
                        {t('newsletter.preferences.promotions', 'Promotions, discounts, and special offers')}
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="recipes"
                        checked={preferences.recipes}
                        onChange={() => handlePreferenceChange('recipes')}
                        className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                      />
                      <label htmlFor="recipes" className="ml-2 block text-sm text-gray-700">
                        {t('newsletter.preferences.recipes', 'Recipes and healthy eating tips')}
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button
                    onClick={handleUpdatePreferences}
                    disabled={savingPreferences}
                    className="bg-brown-600 text-white py-2 px-4 rounded-md hover:bg-brown-700 transition-colors flex items-center justify-center"
                  >
                    {savingPreferences ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        {t('newsletter.preferences.saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        {t('newsletter.preferences.save', 'Save Preferences')}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleUnsubscribe}
                    className="border border-red-500 text-red-500 py-2 px-4 rounded-md hover:bg-red-50 transition-colors"
                  >
                    {t('newsletter.unsubscribe.button', 'Unsubscribe from all emails')}
                  </button>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-700 mb-2">
                  {t('newsletter.unsubscribe.success', 'Unsubscribed Successfully')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {message || t('newsletter.unsubscribe.successMessage', 'You have been successfully unsubscribed from our newsletter.')}
                </p>
                {subscriberEmail && (
                  <p className="text-sm text-gray-500 mb-6">
                    {t('newsletter.unsubscribe.email', 'Email: {{email}}', { email: subscriberEmail })}
                  </p>
                )}
                <Link
                  to={`/?lang=${i18n.language}`}
                  className="inline-block bg-brown-600 text-white py-2 px-6 rounded-md hover:bg-brown-700 transition-colors"
                >
                  {t('common.backToHome', 'Back to Home')}
                </Link>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center py-6">
                <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-700 mb-2">
                  {t('newsletter.unsubscribe.error', 'Error')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {message || t('newsletter.unsubscribe.errorMessage', 'There was a problem processing your request.')}
                </p>
                <Link
                  to={`/?lang=${i18n.language}`}
                  className="inline-block bg-brown-600 text-white py-2 px-6 rounded-md hover:bg-brown-700 transition-colors"
                >
                  {t('common.backToHome', 'Back to Home')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
