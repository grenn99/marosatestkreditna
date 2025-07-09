import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Gift, Mail } from 'lucide-react';
import { subscribeToNewsletter } from '../utils/newsletterService';

interface FirstTimeVisitorDiscountProps {
  onClose: () => void;
}

export function FirstTimeVisitorDiscount({ onClose }: FirstTimeVisitorDiscountProps) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('WELCOME10');
  const [copied, setCopied] = useState(false);

  // Copy discount code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(discountCode).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

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
        source: 'welcome_popup',
        preferences: {
          productUpdates: true,
          promotions: true,
          recipes: true
        },
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

      // Show success state
      setSuccess(true);

      // Store in localStorage that this user has seen the popup
      localStorage.setItem('welcome_discount_shown', 'true');

      // Note: We don't store the discount code here anymore since it will be
      // created after email confirmation and sent in the welcome email

    } catch (err: any) {
      console.error('Error subscribing to newsletter:', err);
      setError(t('newsletter.error', 'An error occurred. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
          aria-label={t('common.close', 'Close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative header */}
        <div className="bg-gradient-to-r from-amber-500 to-brown-600 h-8"></div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-brown-800 mb-2">
                {t('discount.thankYou', 'Thank You!')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('newsletter.confirmation.checkEmail', 'Please check your email to confirm your subscription. After confirmation, you will receive a 10% discount code for your first order.')}
              </p>

              <button
                onClick={onClose}
                className="mt-2 text-brown-600 hover:text-brown-800 font-medium"
              >
                {t('discount.continueShopping', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto bg-amber-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <Gift className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-brown-800 mb-2">
                  {t('discount.welcomeOffer', 'Welcome to Kmetija Maroša!')}
                </h3>
                <p className="text-gray-600">
                  {t('discount.welcomeMessage', 'Get 10% off your first order when you subscribe to our newsletter.')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="popup-first-name" className="block text-sm font-medium text-brown-700 mb-1">
                    {t('newsletter.firstName', 'First Name')} ({t('newsletter.optional', 'optional')})
                  </label>
                  <input
                    type="text"
                    id="popup-first-name"
                    className="shadow-sm focus:ring-brown-500 focus:border-brown-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="popup-email" className="block text-sm font-medium text-brown-700 mb-1">
                    {t('newsletter.email', 'Email Address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="popup-email"
                    className="shadow-sm focus:ring-brown-500 focus:border-brown-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center text-sm text-red-600">
                    <span className="mr-1">⚠️</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
                  disabled={loading}
                >
                  {loading ? t('newsletter.subscribing', 'Subscribing...') : t('discount.getDiscount', 'Get My 10% Discount')}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {t('newsletter.privacy', 'By subscribing, you agree to our Privacy Policy. We respect your privacy and will never share your information.')}
                </p>
              </form>

              <button
                onClick={onClose}
                className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                {t('discount.noThanks', 'No thanks, I\'ll pay full price')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
