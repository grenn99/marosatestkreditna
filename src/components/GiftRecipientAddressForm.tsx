import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, MapPin } from 'lucide-react';

interface RecipientAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface GiftRecipientAddressFormProps {
  hasGiftItems: boolean;
  onAddressChange: (useGiftAddress: boolean, address: RecipientAddress | null) => void;
}

export function GiftRecipientAddressForm({ hasGiftItems, onAddressChange }: GiftRecipientAddressFormProps) {
  const { t } = useTranslation();
  const [useGiftAddress, setUseGiftAddress] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<RecipientAddress>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenija',
  });
  const [postalSuggestions, setPostalSuggestions] = useState<Array<{ code: string; city: string }>>([]);

  // Common postal codes in Slovenia
  const commonPostalCodes = [
    { code: "1000", city: "Ljubljana" },
    { code: "2000", city: "Maribor" },
    { code: "3000", city: "Celje" },
    { code: "4000", city: "Kranj" },
    { code: "5000", city: "Nova Gorica" },
    { code: "6000", city: "Koper" }
  ];

  // If there are no gift items, reset the form and notify parent
  useEffect(() => {
    if (!hasGiftItems && useGiftAddress) {
      setUseGiftAddress(false);
      onAddressChange(false, null);
    }
  }, [hasGiftItems, useGiftAddress, onAddressChange]);

  // Handle checkbox change
  const handleUseGiftAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseGiftAddress(checked);
    onAddressChange(checked, checked ? recipientAddress : null);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update the recipient address
    const updatedAddress = { ...recipientAddress, [name]: value };
    setRecipientAddress(updatedAddress);

    // Show postal code suggestions
    if (name === 'postalCode') {
      const suggestions = value ? commonPostalCodes.filter(p =>
        p.code.startsWith(value) || p.city.toLowerCase().includes(value.toLowerCase())
      ) : [];
      setPostalSuggestions(suggestions);

      // Auto-fill city when selecting from postal suggestions
      const match = commonPostalCodes.find(p => p.code === value);
      if (match) {
        const cityUpdatedAddress = { ...updatedAddress, city: match.city };
        setRecipientAddress(cityUpdatedAddress);
        setPostalSuggestions([]);
        onAddressChange(useGiftAddress, cityUpdatedAddress);
        return;
      }
    }

    // Notify parent of the change
    onAddressChange(useGiftAddress, updatedAddress);
  };

  // Select a postal code suggestion
  const selectPostalSuggestion = (suggestion: { code: string; city: string }) => {
    const updatedAddress = {
      ...recipientAddress,
      postalCode: suggestion.code,
      city: suggestion.city
    };
    setRecipientAddress(updatedAddress);
    setPostalSuggestions([]);
    onAddressChange(useGiftAddress, updatedAddress);
  };

  // If there are no gift items, don't render the component
  if (!hasGiftItems) {
    return null;
  }

  return (
    <div className="mt-6 border border-amber-200 rounded-lg p-4 bg-amber-50">
      <div className="flex items-center mb-4">
        <Gift className="w-5 h-5 text-amber-600 mr-2" />
        <h3 className="text-lg font-medium text-amber-800">
          {t('checkout.giftDeliveryAddress', 'Gift Delivery Address')}
        </h3>
      </div>

      <div className="flex items-start mb-4">
        <input
          type="checkbox"
          id="use-gift-address"
          checked={useGiftAddress}
          onChange={handleUseGiftAddressChange}
          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 mt-1"
        />
        <label htmlFor="use-gift-address" className="ml-2 block text-amber-700">
          {t('checkout.useGiftAddress', 'Send gift to a different address')}
          <p className="text-sm text-amber-600 mt-1">
            {t('checkout.giftAddressDescription', 'If you want to send your gift directly to the recipient, please provide their address.')}
          </p>
        </label>
      </div>

      {useGiftAddress && (
        <div className="space-y-4 mt-4 p-4 border border-amber-200 rounded-lg bg-white">
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 text-amber-600 mr-2" />
            <h4 className="font-medium text-amber-800">
              {t('checkout.giftRecipientName', 'Gift Recipient Name')}
            </h4>
          </div>

          {/* Recipient Name */}
          <div>
            <label htmlFor="gift-recipient-name" className="block text-sm font-medium text-gray-700">
              {t('checkout.giftRecipientName', 'Gift Recipient Name')} *
            </label>
            <input
              type="text"
              id="gift-recipient-name"
              name="name"
              value={recipientAddress.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('checkout.giftRecipientNamePlaceholder', 'Full name of the gift recipient')}
            />
          </div>

          {/* Recipient Address */}
          <div>
            <label htmlFor="gift-recipient-address" className="block text-sm font-medium text-gray-700">
              {t('checkout.giftRecipientAddress', 'Gift Recipient Address')} *
            </label>
            <input
              type="text"
              id="gift-recipient-address"
              name="address"
              value={recipientAddress.address}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('checkout.giftRecipientAddressPlaceholder', 'Street address of the gift recipient')}
            />
          </div>

          {/* Postal Code and City in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Postal Code */}
            <div className="relative">
              <label htmlFor="gift-recipient-postal-code" className="block text-sm font-medium text-gray-700">
                {t('checkout.form.postalCode', 'Postal Code')} *
              </label>
              <input
                type="text"
                id="gift-recipient-postal-code"
                name="postalCode"
                value={recipientAddress.postalCode}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('checkout.form.postalCode', 'e.g., 1000')}
              />
              {postalSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {postalSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.code}
                      className="px-4 py-2 hover:bg-amber-50 cursor-pointer"
                      onClick={() => selectPostalSuggestion(suggestion)}
                    >
                      {suggestion.code} - {suggestion.city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="gift-recipient-city" className="block text-sm font-medium text-gray-700">
                {t('checkout.form.city', 'City')} *
              </label>
              <input
                type="text"
                id="gift-recipient-city"
                name="city"
                value={recipientAddress.city}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder={t('checkout.form.city', 'e.g., Ljubljana')}
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="gift-recipient-country" className="block text-sm font-medium text-gray-700">
              {t('checkout.form.country', 'Country')} *
            </label>
            <select
              id="gift-recipient-country"
              name="country"
              value={recipientAddress.country}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="Slovenija">{t('countries.slovenia', 'Slovenija')}</option>
              <option value="Hrvaška">{t('countries.croatia', 'Hrvaška')}</option>
              <option value="Avstrija">{t('countries.austria', 'Avstrija')}</option>
              <option value="Italija">{t('countries.italy', 'Italija')}</option>
              <option value="Madžarska">{t('countries.hungary', 'Madžarska')}</option>
              <option value="Deutschland">{t('countries.germany', 'Deutschland')}</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
