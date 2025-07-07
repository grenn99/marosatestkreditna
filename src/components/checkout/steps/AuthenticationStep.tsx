import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthSubState } from '../../../types/checkout';
import PasswordStrengthMeter from '../../PasswordStrengthMeter';

interface AuthenticationStepProps {
  authSubState: AuthSubState;
  setAuthSubState: (state: AuthSubState) => void;
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  onChange: (name: string, value: string) => void;
  onLogin: () => Promise<void>;
  onSignUp: () => Promise<void>;
  authError: string | null;
  isSubmitting: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

/**
 * Authentication step for login or registration
 */
export const AuthenticationStep: React.FC<AuthenticationStepProps> = ({
  authSubState,
  setAuthSubState,
  formData,
  onChange,
  onLogin,
  onSignUp,
  authError,
  isSubmitting,
  showPassword,
  setShowPassword
}) => {
  const { t } = useTranslation();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authSubState === 'login') {
      await onLogin();
    } else if (authSubState === 'signup') {
      await onSignUp();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {authSubState === 'login' 
          ? t('checkout.login', 'Prijava') 
          : t('checkout.createAccount', 'Ustvarite račun')}
      </h2>
      
      {/* Auth Error */}
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{authError}</p>
        </div>
      )}
      
      {/* Auth Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-medium ${
            authSubState === 'login' 
              ? 'border-b-2 border-brown-600 text-brown-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setAuthSubState('login')}
        >
          {t('checkout.login', 'Prijava')}
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            authSubState === 'signup' 
              ? 'border-b-2 border-brown-600 text-brown-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setAuthSubState('signup')}
        >
          {t('checkout.register', 'Registracija')}
        </button>
      </div>
      
      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.email', 'E-poštni naslov')} *
          </label>
          <input
            type="email"
            id="auth-email"
            name="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Password */}
        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.password', 'Geslo')} *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="auth-password"
              name="password"
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Confirm Password (only for signup) */}
        {authSubState === 'signup' && (
          <>
            <div>
              <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.form.confirmPassword', 'Potrdi geslo')} *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="auth-confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                required
                disabled={isSubmitting}
              />
            </div>
            
            {/* Password Strength Meter */}
            <div>
              <PasswordStrengthMeter password={formData.password} />
            </div>
          </>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-brown-600 text-white rounded-md hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span>{t('common.loading', 'Nalaganje...')}</span>
          ) : authSubState === 'login' ? (
            <span>{t('checkout.loginButton', 'Prijava')}</span>
          ) : (
            <span>{t('checkout.registerButton', 'Registracija')}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AuthenticationStep;
