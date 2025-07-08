import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No confirmation code provided');
          return;
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          setStatus('error');
          setMessage(exchangeError.message);
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! You can now sign in.');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate('/login?confirmed=true');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to confirm email');
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <img src="/logo.svg" alt="Kmetija Maroša" className="h-16" />
            </div>

            <h1 className="text-2xl font-bold text-center text-brown-800 mb-6">
              {t('auth.emailConfirmation', 'Email Confirmation')}
            </h1>

            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="w-12 h-12 text-brown-600 animate-spin mb-4" />
                <p className="text-gray-600">
                  {t('auth.confirmingEmail', 'Confirming your email...')}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-700 mb-2">
                  {t('auth.emailConfirmed', 'Email Confirmed!')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  {t('auth.redirectingToLogin', 'Redirecting to login page...')}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6">
                <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-700 mb-2">
                  {t('auth.confirmationError', 'Confirmation Error')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-block bg-brown-600 text-white py-2 px-6 rounded-md hover:bg-brown-700 transition-colors"
                >
                  {t('auth.goToLogin', 'Go to Login')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
