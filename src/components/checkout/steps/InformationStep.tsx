import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { isValidEmail } from '../../../utils/validation';
import PasswordStrengthMeter from '../../PasswordStrengthMeter';
import { CheckoutStep, AuthSubState } from '../CheckoutContainer';

interface InformationStepProps {
  onNext: () => void;
  setError: (error: string | null) => void;
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  authSubState: AuthSubState;
  setAuthSubState: (state: AuthSubState) => void;
}

export const InformationStep: React.FC<InformationStepProps> = ({
  onNext,
  setError,
  checkoutStep,
  setCheckoutStep,
  authSubState,
  setAuthSubState
}) => {
  const { t } = useTranslation();
  const { user, signInWithPassword, signUp, checkEmailExists } = useAuth();

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    saveInfo: false
  });

  // Auth-related states
  const [emailToCheck, setEmailToCheck] = useState<string>('');
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Effect to pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      // Fetch user profile data to pre-fill the form
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }

          if (data) {
            // Set email from user auth data
            const userEmail = user.email || '';

            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              name: data.full_name || '',
              email: userEmail,
              phone: data.telephone_nr || '',
            }));
          }
        } catch (err) {
          console.error('Exception fetching user profile:', err);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Reset errors when user types
    setError(null);
    setAuthError(null);

    // Check email existence when typing in email field
    if (name === 'email' && value !== emailToCheck) {
      setEmailToCheck(value);
    }
  };

  // Check if email exists when user types
  useEffect(() => {
    const checkEmail = async () => {
      if (emailToCheck && isValidEmail(emailToCheck) && authSubState === 'initial') {
        setCheckingEmail(true);
        try {
          const exists = await checkEmailExists(emailToCheck);
          
          if (exists) {
            // Email exists, show login form
            setAuthSubState('login');
          } else {
            // Email doesn't exist, show signup form
            setAuthSubState('signup');
          }
        } catch (err) {
          console.error('Error checking email:', err);
        } finally {
          setCheckingEmail(false);
        }
      }
    };

    const debounceTimer = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounceTimer);
  }, [emailToCheck, checkEmailExists, authSubState, setAuthSubState]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!formData.email || !formData.password) {
      setAuthError(t('auth.errors.missingFields', 'Please enter your email and password'));
      return;
    }

    try {
      const { error } = await signInWithPassword(formData.email, formData.password);
      
      if (error) {
        setAuthError(t('auth.errors.invalidCredentials', 'Invalid email or password'));
        return;
      }
      
      // Successfully logged in, will be handled by the auth state effect
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(t('auth.errors.loginFailed', 'Login failed. Please try again.'));
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setAuthError(t('auth.errors.allFieldsRequired', 'All fields are required'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAuthError(t('auth.errors.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    if (passwordStrength < 2) {
      setAuthError(t('auth.errors.passwordTooWeak', 'Password is too weak'));
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.name,
        telephone_nr: formData.phone
      });
      
      if (error) {
        setAuthError(t('auth.errors.signupFailed', 'Signup failed: ') + error.message);
        return;
      }
      
      // Successfully signed up, will be handled by the auth state effect
    } catch (err) {
      console.error('Signup error:', err);
      setAuthError(t('auth.errors.signupFailed', 'Signup failed. Please try again.'));
    }
  };

  // Handle guest checkout
  const handleGuestCheckout = () => {
    setCheckoutStep('guest_form');
    onNext();
  };

  // Handle continue as logged in user
  const handleContinueAsUser = () => {
    onNext();
  };

  // Validate form before proceeding
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError(t('checkout.errors.personalInfoRequired', 'Please fill in all personal information fields'));
      return false;
    }
    
    if (!isValidEmail(formData.email)) {
      setError(t('checkout.errors.invalidEmail', 'Please enter a valid email address'));
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNext();
    }
  };

  // Render the appropriate form based on auth state
  const renderAuthForm = () => {
    if (authSubState === 'initial') {
      return (
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              {t('checkout.form.email', 'Email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.emailPlaceholder', 'your@email.com')}
              required
            />
            {checkingEmail && (
              <p className="text-gray-500 text-sm mt-1">
                {t('checkout.checkingEmail', 'Checking email...')}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (authSubState === 'login') {
      return (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              {t('checkout.form.email', 'Email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.emailPlaceholder', 'your@email.com')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              {t('checkout.form.password', 'Password')} *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          {authError && (
            <div className="text-red-500 text-sm mb-4">
              {authError}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setAuthSubState('initial')}
              className="text-blue-600 hover:underline"
            >
              {t('checkout.backToOptions', 'Back')}
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={checkingEmail}
            >
              {t('auth.login', 'Login')}
            </button>
          </div>
        </form>
      );
    }

    if (authSubState === 'signup') {
      return (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              {t('checkout.form.name', 'Full Name')} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.namePlaceholder', 'John Doe')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              {t('checkout.form.email', 'Email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.emailPlaceholder', 'your@email.com')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              {t('checkout.form.phone', 'Phone')} *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.phonePlaceholder', '123 456 789')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              {t('checkout.form.password', 'Password')} *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => {
                handleInputChange(e);
                // Update password strength
                setPasswordStrength(e.target.value.length > 8 ? 3 : e.target.value.length > 5 ? 2 : 1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <PasswordStrengthMeter strength={passwordStrength} />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              {t('checkout.form.confirmPassword', 'Confirm Password')} *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="saveInfo"
                checked={formData.saveInfo}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-gray-700">
                {t('checkout.form.saveInfo', 'Save my information for faster checkout next time')}
              </span>
            </label>
          </div>
          
          {authError && (
            <div className="text-red-500 text-sm mb-4">
              {authError}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setAuthSubState('initial')}
              className="text-blue-600 hover:underline"
            >
              {t('checkout.backToOptions', 'Back')}
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={checkingEmail}
            >
              {t('auth.signup', 'Sign Up')}
            </button>
          </div>
        </form>
      );
    }

    if (authSubState === 'loggedIn') {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              {t('checkout.loggedInAs', 'Logged in as')} <strong>{user?.email}</strong>
            </p>
          </div>
          
          <button
            onClick={handleContinueAsUser}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('checkout.continueToShipping', 'Continue to Shipping')}
          </button>
        </div>
      );
    }

    return null;
  };

  // Render checkout options or the appropriate form
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {t('checkout.steps.information', 'Information')}
      </h2>
      
      {checkoutStep === 'selection' ? (
        <div className="space-y-4">
          <button
            onClick={() => setCheckoutStep('auth_form')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('checkout.loginOrSignup', 'Login or Sign Up')}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t('checkout.or', 'OR')}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleGuestCheckout}
            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('checkout.continueAsGuest', 'Continue as Guest')}
          </button>
        </div>
      ) : checkoutStep === 'auth_form' ? (
        renderAuthForm()
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              {t('checkout.form.name', 'Full Name')} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.namePlaceholder', 'John Doe')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              {t('checkout.form.email', 'Email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.emailPlaceholder', 'your@email.com')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              {t('checkout.form.phone', 'Phone')} *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.phonePlaceholder', '123 456 789')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="saveInfo"
                checked={formData.saveInfo}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-gray-700">
                {t('checkout.form.saveInfo', 'Save my information for faster checkout next time')}
              </span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('checkout.continue', 'Continue')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InformationStep;
