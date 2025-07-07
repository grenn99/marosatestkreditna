import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, AlertCircle, Loader } from 'lucide-react';
import { confirmSubscription } from '../utils/newsletterService';

export default function ConfirmSubscriptionPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const langParam = searchParams.get('lang');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [confirmationAttempted, setConfirmationAttempted] = useState(false);

  // Set language from URL parameter if provided
  useEffect(() => {
    if (langParam && langParam !== i18n.language) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  // Confirm subscription when component mounts
  useEffect(() => {
    const confirmSubscriptionToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('newsletter.confirmation.noToken', 'No confirmation token provided'));
        return;
      }

      // Prevent multiple confirmation attempts
      if (confirmationAttempted) {
        console.log('Confirmation already attempted, skipping duplicate call');
        return;
      }

      setConfirmationAttempted(true);

      try {
        console.log('Confirming subscription with token:', token);
        const result = await confirmSubscription(token);
        console.log('Confirmation result:', result);

        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          if (result.subscriber?.email) {
            setSubscriberEmail(result.subscriber.email);
          }

          // Mark the welcome popup as permanently shown after successful confirmation
          localStorage.setItem('welcome_discount_shown', 'true');

          // Also remove any temporary hiding flags
          localStorage.removeItem('welcome_discount_temp_hidden');
          localStorage.removeItem('welcome_discount_temp_hidden_until');
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        console.error('Error confirming subscription:', error);
        setStatus('error');
        setMessage(t('newsletter.confirmation.error', 'An error occurred while confirming your subscription'));
      }
    };

    confirmSubscriptionToken();
  }, [token, t, confirmationAttempted]);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <img src="/logo.svg" alt="Kmetija Maroša" className="h-16" />
            </div>

            <h1 className="text-2xl font-bold text-center text-brown-800 mb-6">
              {t('newsletter.confirmation.title', 'Newsletter Subscription')}
            </h1>

            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="w-12 h-12 text-brown-600 animate-spin mb-4" />
                <p className="text-gray-600">
                  {t('newsletter.confirmation.loading', 'Confirming your subscription...')}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-700 mb-2">
                  {t('newsletter.confirmation.success', 'Subscription Confirmed!')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {message || t('newsletter.confirmation.successMessage', 'Thank you for confirming your subscription to our newsletter.')}
                </p>
                {subscriberEmail && (
                  <p className="text-sm text-gray-500 mb-6">
                    {t('newsletter.confirmation.subscribedEmail', 'Subscribed email: {{email}}', { email: subscriberEmail })}
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
                  {t('newsletter.confirmation.error', 'Confirmation Error')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {message || t('newsletter.confirmation.errorMessage', 'There was a problem confirming your subscription.')}
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
