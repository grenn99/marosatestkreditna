import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter } from '../utils/newsletterService';

export function NewsletterSignup() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    productUpdates: true,
    promotions: true,
    recipes: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(t('newsletter.emailRequired', 'Please enter your email address'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Subscribe to newsletter using the new service
      const result = await subscribeToNewsletter({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim() || undefined,
        preferences,
        source: 'website_footer',
        language: i18n.language
      });

      if (!result.success) {
        if (result.isExisting) {
          setError(t('newsletter.alreadySubscribed', 'This email is already subscribed to our newsletter'));
        } else {
          throw new Error(result.message);
        }
        return;
      }

      setSuccess(true);
      setEmail('');
      setFirstName('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error subscribing to newsletter:', err);
      setError(t('newsletter.error', 'An error occurred. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brown-50 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <Mail className="w-5 h-5 text-brown-600 mr-2" />
        <h3 className="text-xl font-semibold text-brown-800">
          {t('newsletter.title', 'Subscribe to Our Newsletter')}
        </h3>
      </div>

      <p className="text-brown-700 mb-4">
        {t('newsletter.description', 'Stay updated with our latest products, special offers, and seasonal recipes.')}
      </p>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
          <p className="text-green-700">
            {t('newsletter.success', 'Thank you for subscribing! Please check your email to confirm your subscription.')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newsletter-first-name" className="block text-sm font-medium text-brown-700 mb-1">
              {t('newsletter.firstName', 'First Name')} ({t('newsletter.optional', 'optional')})
            </label>
            <input
              type="text"
              id="newsletter-first-name"
              className="shadow-sm focus:ring-brown-500 focus:border-brown-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="newsletter-email" className="block text-sm font-medium text-brown-700 mb-1">
              {t('newsletter.email', 'Email Address')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="newsletter-email"
              className="shadow-sm focus:ring-brown-500 focus:border-brown-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-brown-700">
              {t('newsletter.preferences.title', 'I would like to receive:')}
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter-product-updates"
                checked={preferences.productUpdates}
                onChange={() => setPreferences(prev => ({ ...prev, productUpdates: !prev.productUpdates }))}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter-product-updates" className="ml-2 block text-sm text-gray-700">
                {t('newsletter.preferences.productUpdates', 'Product updates and new arrivals')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter-promotions"
                checked={preferences.promotions}
                onChange={() => setPreferences(prev => ({ ...prev, promotions: !prev.promotions }))}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter-promotions" className="ml-2 block text-sm text-gray-700">
                {t('newsletter.preferences.promotions', 'Promotions and special offers')}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter-recipes"
                checked={preferences.recipes}
                onChange={() => setPreferences(prev => ({ ...prev, recipes: !prev.recipes }))}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter-recipes" className="ml-2 block text-sm text-gray-700">
                {t('newsletter.preferences.recipes', 'Recipes and healthy eating tips')}
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
            disabled={loading}
          >
            {loading ? t('newsletter.subscribing', 'Subscribing...') : t('newsletter.subscribe', 'Subscribe')}
          </button>

          <p className="text-xs text-gray-500">
            {t('newsletter.privacy', 'By subscribing, you agree to our Privacy Policy. We respect your privacy and will never share your information.')}
          </p>
        </form>
      )}
    </div>
  );
}
