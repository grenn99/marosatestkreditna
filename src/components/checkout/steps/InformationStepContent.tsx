import React from 'react';
import { useTranslation } from 'react-i18next';
import PasswordStrengthMeter from '../../PasswordStrengthMeter';
import { CheckoutFormData, CheckoutStep, AuthSubState } from '../../../types/checkout';

interface InformationStepContentProps {
  formData: CheckoutFormData;
  handleInputChange: (nameOrEvent: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, valueParam?: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  checkoutStep: CheckoutStep;
  authSubState: AuthSubState;
  getPhonePlaceholder: (country: string, translateFunc: (key: string, fallback: string) => string) => string;
}

export const InformationStepContent: React.FC<InformationStepContentProps> = ({
  formData,
  handleInputChange,
  showPassword,
  setShowPassword,
  checkoutStep,
  authSubState,
  getPhonePlaceholder
}) => {
  const { t } = useTranslation();

  // Render signup form fields
  const renderSignupFields = () => (
    <>
      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('checkout.email', 'Email Address')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => handleInputChange(e)}
          required
          placeholder={t('checkout.form.emailPlaceholder', 'janez.novak@primer.si')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('checkout.password', 'Password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={(e) => handleInputChange(e)}
            required
            placeholder="********"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? t('checkout.hide', 'Skrij') : t('checkout.show', 'Pokaži')}
          </button>
        </div>

        {/* Password strength meter */}
        {formData.password && (
          <div className="mt-2">
            <PasswordStrengthMeter password={formData.password} />
            {showPassword && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {t('auth.passwordVisibilityWarning', 'Geslo je trenutno vidno. Prepričajte se, da vas nihče ne opazuje.')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          {t('checkout.confirmPassword', 'Ponovite geslo')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange(e)}
            required
            placeholder="********"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
          >
            {showPassword ? t('checkout.hide', 'Skrij') : t('checkout.show', 'Pokaži')}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Full Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('checkout.fullName', 'Full Name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange(e)}
          required
          placeholder={t('checkout.form.namePlaceholder', 'Janez Novak')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
        />
      </div>

      {/* Email - for non-signup forms */}
      {authSubState !== 'signup' && (
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('checkout.email', 'Email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleInputChange(e)}
            required
            placeholder="email@example.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
          />
        </div>
      )}

      {/* Signup fields for registration */}
      {authSubState === 'signup' && renderSignupFields()}

      {/* Phone Number */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          {t('checkout.phone', 'Telefonska številka')}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange(e)}
          required
          placeholder={getPhonePlaceholder(formData.country, t)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
        />
      </div>
    </>
  );
};

export default InformationStepContent;
