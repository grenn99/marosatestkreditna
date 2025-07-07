import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SHIPPING, POSTAL_CODES, VALIDATION } from '../../config/appConfig';
import { useErrorHandler } from '../../utils/errorMonitoring';
import { validateRequired, validateEmail, validatePhone, validatePostalCode } from '../../utils/formValidation';

interface PostalCodeSuggestion {
  code: string;
  city: string;
}

interface CheckoutFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    notes: string;
  };
  onChange: (name: string, value: string) => void;
  onEmailBlur?: () => void;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Checkout form component for collecting shipping information
 */
export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  formData,
  onChange,
  onEmailBlur,
  isSubmitting,
  error
}) => {
  const { t } = useTranslation();
  const errorHandler = useErrorHandler({ source: 'CheckoutForm' });
  const [postalSuggestions, setPostalSuggestions] = useState<PostalCodeSuggestion[]>([]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
    
    // Show postal code suggestions
    if (name === 'postalCode') {
      const suggestions = value ? POSTAL_CODES.filter(p =>
        p.code.startsWith(value) || p.city.toLowerCase().includes(value.toLowerCase())
      ) : [];
      setPostalSuggestions(suggestions);
      
      // Auto-fill city when selecting from postal suggestions
      const match = POSTAL_CODES.find(p => p.code === value);
      if (match) {
        onChange('city', match.city);
        setPostalSuggestions([]);
      }
    }
  };
  
  // Handle postal code suggestion selection
  const handlePostalSuggestionClick = (suggestion: PostalCodeSuggestion) => {
    onChange('postalCode', suggestion.code);
    onChange('city', suggestion.city);
    setPostalSuggestions([]);
  };
  
  // Get phone placeholder based on country
  const getPhonePlaceholder = (country: string): string => {
    switch (country) {
      case 'Slovenija':
        return '040 443 232';
      case 'Hrvaška':
        return '+385 9X XXX XXXX';
      case 'Avstrija':
        return '+43 6XX XXX XXXX';
      default:
        return t('checkout.form.phonePlaceholderGeneric', 'Phone Number');
    }
  };
  
  // Validate form fields
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        return validateRequired(value, t('checkout.form.name', 'Full Name')).isValid ? null : 
          t('checkout.errors.nameRequired', 'Name is required.');
      case 'email':
        return validateEmail(value).isValid ? null : 
          t('checkout.errors.emailRequired', 'Please enter a valid email address.');
      case 'phone':
        return validatePhone(value).isValid ? null : 
          t('checkout.errors.phoneRequired', 'Please enter a valid phone number.');
      case 'address':
        return validateRequired(value, t('checkout.form.address', 'Address')).isValid ? null : 
          t('checkout.errors.addressRequired', 'Address is required.');
      case 'city':
        return validateRequired(value, t('checkout.form.city', 'City')).isValid ? null : 
          t('checkout.errors.cityRequired', 'City is required.');
      case 'postalCode':
        return validatePostalCode(value).isValid ? null : 
          t('checkout.errors.invalidPostalCode', 'Please enter a valid 4-digit postal code.');
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('checkout.shippingInfo', 'Podatki za dostavo')}</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.name', 'Polno ime')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            placeholder={t('checkout.form.namePlaceholder', 'Janez Novak')}
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.email', 'E-poštni naslov')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={onEmailBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            placeholder="janez.novak@example.com"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.phone', 'Telefonska številka')} *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            placeholder={getPhonePlaceholder(formData.country)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.address', 'Naslov')} *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            placeholder={t('checkout.form.addressPlaceholder', 'Slovenska cesta 1')}
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Postal Code and City in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Postal Code */}
          <div className="relative">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.form.postalCode', 'Poštna številka')} *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder="1000"
              required
              disabled={isSubmitting}
            />
            
            {/* Postal code suggestions */}
            {postalSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {postalSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.code}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handlePostalSuggestionClick(suggestion)}
                  >
                    {suggestion.code} - {suggestion.city}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.form.city', 'Mesto')} *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder="Ljubljana"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.country', 'Država')} *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
            disabled={isSubmitting}
          >
            {SHIPPING.countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.form.notes', 'Opombe k naročilu (neobvezno)')}
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            placeholder={t('checkout.form.notesPlaceholder', 'Dodatne informacije za dostavo...')}
            disabled={isSubmitting}
          ></textarea>
        </div>
      </div>
    </div>
  );
};
