import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, MapPin } from 'lucide-react';
import { SHIPPING, POSTAL_CODES, VALIDATION } from '../config/appConfig';
import { validateRequired, validatePostalCode } from '../utils/formValidation';

interface PostalCodeSuggestion {
  code: string;
  city: string;
}

interface GiftRecipientFormProps {
  enabled: boolean;
  onAddressChange: (useAlternateAddress: boolean, recipientAddress: RecipientAddress | null) => void;
}

export interface RecipientAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export function GiftRecipientForm({ enabled, onAddressChange }: GiftRecipientFormProps) {
  const { t } = useTranslation();
  const [useAlternateAddress, setUseAlternateAddress] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<RecipientAddress>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenija'
  });
  const [postalSuggestions, setPostalSuggestions] = useState<PostalCodeSuggestion[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Reset form when enabled changes
  useEffect(() => {
    if (!enabled) {
      setUseAlternateAddress(false);
      setRecipientAddress({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Slovenija'
      });
      setErrors({});
    }
  }, [enabled]);

  // Notify parent component when address changes
  useEffect(() => {
    onAddressChange(useAlternateAddress, useAlternateAddress ? recipientAddress : null);
  }, [useAlternateAddress, recipientAddress, onAddressChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Update the form data
    setRecipientAddress(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Handle postal code suggestions
    if (name === 'postalCode' && value.length > 0) {
      const suggestions = POSTAL_CODES.filter(pc =>
        pc.code.startsWith(value) || pc.city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);

      setPostalSuggestions(suggestions);

      // If we have an exact match, auto-fill the city
      const exactMatch = POSTAL_CODES.find(pc => pc.code === value);
      if (exactMatch) {
        setRecipientAddress(prev => ({
          ...prev,
          city: exactMatch.city
        }));
        setPostalSuggestions([]);
      }
    } else if (name === 'postalCode' && value.length === 0) {
      setPostalSuggestions([]);
    }
  };

  const selectPostalSuggestion = (suggestion: PostalCodeSuggestion) => {
    setRecipientAddress(prev => ({
      ...prev,
      postalCode: suggestion.code,
      city: suggestion.city
    }));
    setPostalSuggestions([]);
  };

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        return validateRequired(value, t('checkout.form.name', 'Name')).isValid ? null :
          t('checkout.errors.nameRequired', 'Name is required.');
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

  if (!enabled) {
    return null;
  }

  return (
    <div className="border-2 border-pink-300 rounded-lg p-5 bg-pink-50 shadow-sm">
      <div className="flex items-center mb-4">
        <Gift className="w-6 h-6 text-pink-600 mr-2" />
        <h3 className="text-xl font-semibold text-pink-800">
          {t('checkout.giftRecipient.title', 'Send Gift to a Friend')}
        </h3>
      </div>

      <div className="mb-5 bg-white p-4 rounded-lg border border-pink-200">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="use-alternate-address"
            className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            checked={useAlternateAddress}
            onChange={() => setUseAlternateAddress(!useAlternateAddress)}
          />
          <label htmlFor="use-alternate-address" className="ml-2 block text-base font-medium text-gray-800">
            {t('checkout.giftRecipient.useAlternateAddress', 'Send gift directly to my friend')}
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-3 ml-7">
          {useAlternateAddress
            ? t('checkout.giftRecipient.alternateAddressSelected', 'Your gift will be sent directly to your friend at the address you specify below.')
            : t('checkout.giftRecipient.useAlternateAddressHint', 'Select this option to send the gift directly to your friend. Otherwise, the gift will be delivered to your shipping address.')}
        </p>
      </div>

      {useAlternateAddress && (
        <div className="space-y-4 border-t border-pink-200 pt-4 mt-4">
          <div className="flex items-center mb-3">
            <MapPin className="w-5 h-5 text-pink-600 mr-2" />
            <h4 className="text-base font-medium text-pink-800">
              {t('checkout.giftRecipient.recipientAddress', 'Friend\'s Address')}
            </h4>
          </div>

          {/* Recipient Name */}
          <div>
            <label htmlFor="recipient-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.giftRecipient.recipientName', 'Friend\'s Full Name')} *
            </label>
            <input
              type="text"
              id="recipient-name"
              name="name"
              value={recipientAddress.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
              } rounded-md focus:outline-none focus:ring-2`}
              placeholder={t('checkout.giftRecipient.recipientNamePlaceholder', 'Full name of your friend')}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Recipient Address */}
          <div>
            <label htmlFor="recipient-address" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.giftRecipient.recipientAddress', 'Friend\'s Address')} *
            </label>
            <input
              type="text"
              id="recipient-address"
              name="address"
              value={recipientAddress.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
              } rounded-md focus:outline-none focus:ring-2`}
              placeholder={t('checkout.giftRecipient.recipientAddressPlaceholder', 'Your friend\'s street address')}
              required
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Postal Code and City in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Postal Code */}
            <div className="relative">
              <label htmlFor="recipient-postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.form.postalCode', 'Postal Code')} *
              </label>
              <input
                type="text"
                id="recipient-postalCode"
                name="postalCode"
                value={recipientAddress.postalCode}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  errors.postalCode ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
                } rounded-md focus:outline-none focus:ring-2`}
                placeholder="1000"
                required
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
              )}

              {/* Postal code suggestions */}
              {postalSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                  {postalSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.code}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectPostalSuggestion(suggestion)}
                    >
                      <span className="font-medium">{suggestion.code}</span> - {suggestion.city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="recipient-city" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.form.city', 'City')} *
              </label>
              <input
                type="text"
                id="recipient-city"
                name="city"
                value={recipientAddress.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
                } rounded-md focus:outline-none focus:ring-2`}
                placeholder={t('checkout.form.cityPlaceholder', 'Ljubljana')}
                required
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="recipient-country" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.form.country', 'Country')} *
            </label>
            <select
              id="recipient-country"
              name="country"
              value={recipientAddress.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              {SHIPPING.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
