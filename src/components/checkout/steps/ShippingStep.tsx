import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidPostalCode } from '../../../utils/validation';
import { useCart } from '../../../context/CartContext';

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
  setError: (error: string | null) => void;
}

interface PostalCodeSuggestion {
  code: string;
  city: string;
}

export const ShippingStep: React.FC<ShippingStepProps> = ({
  onNext,
  onBack,
  setError
}) => {
  const { t } = useTranslation();
  const { updateShippingAddress } = useCart();

  // Form data state
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenija',
    notes: ''
  });

  // Postal code suggestions
  const [postalCodeSuggestions, setPostalCodeSuggestions] = useState<PostalCodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset errors when user types
    setError(null);

    // Handle postal code input for Slovenia
    if (name === 'postalCode' && formData.country === 'Slovenija') {
      handlePostalCodeInput(value);
    }
  };

  // Handle postal code input and show suggestions
  const handlePostalCodeInput = (value: string) => {
    if (value.length >= 2) {
      // Simplified postal code suggestions for Slovenia
      const slovenianPostalCodes: PostalCodeSuggestion[] = [
        { code: '1000', city: 'Ljubljana' },
        { code: '2000', city: 'Maribor' },
        { code: '3000', city: 'Celje' },
        { code: '4000', city: 'Kranj' },
        { code: '5000', city: 'Nova Gorica' },
        { code: '6000', city: 'Koper' },
        { code: '8000', city: 'Novo mesto' },
        { code: '9000', city: 'Murska Sobota' }
      ];

      const filteredSuggestions = slovenianPostalCodes.filter(
        suggestion => suggestion.code.startsWith(value) || suggestion.city.toLowerCase().includes(value.toLowerCase())
      );

      setPostalCodeSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Select a postal code suggestion
  const selectPostalCodeSuggestion = (suggestion: PostalCodeSuggestion) => {
    setFormData(prev => ({
      ...prev,
      postalCode: suggestion.code,
      city: suggestion.city
    }));
    setShowSuggestions(false);
  };

  // Validate form before proceeding
  const validateForm = () => {
    if (!formData.address || !formData.city || !formData.postalCode || !formData.country) {
      setError(t('checkout.errors.shippingInfoRequired', 'Please fill in all shipping information fields'));
      return false;
    }
    
    // Validate postal code format based on country
    if (formData.country === 'Slovenija' && !isValidPostalCode(formData.postalCode, 'SI')) {
      setError(t('checkout.errors.invalidPostalCode', 'Please enter a valid postal code (4 digits for Slovenia)'));
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update shipping address in cart context
      updateShippingAddress({
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        notes: formData.notes
      });
      
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {t('checkout.steps.shipping', 'Shipping')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="address">
            {t('checkout.form.address', 'Address')} *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={t('checkout.form.addressPlaceholder', 'Street address, apartment, etc.')}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="postalCode">
            {t('checkout.form.postalCode', 'Postal Code')} *
          </label>
          <div className="relative">
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('checkout.form.postalCodePlaceholder', '1000')}
              required
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {postalCodeSuggestions.map(suggestion => (
                  <div
                    key={suggestion.code}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectPostalCodeSuggestion(suggestion)}
                  >
                    {suggestion.code} - {suggestion.city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="city">
            {t('checkout.form.city', 'City')} *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={t('checkout.form.cityPlaceholder', 'Ljubljana')}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="country">
            {t('checkout.form.country', 'Country')} *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="Slovenija">{t('countries.slovenia', 'Slovenia')}</option>
            <option value="Hrvaška">{t('countries.croatia', 'Croatia')}</option>
            <option value="Avstrija">{t('countries.austria', 'Austria')}</option>
            <option value="Italija">{t('countries.italy', 'Italy')}</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="notes">
            {t('checkout.form.notes', 'Order Notes')} ({t('common.optional', 'Optional')})
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={t('checkout.form.notesPlaceholder', 'Special instructions for delivery')}
            rows={3}
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('checkout.back', 'Back')}
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('checkout.continue', 'Continue')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingStep;
