import React from 'react';
import { useTranslation } from 'react-i18next';
import { GiftRecipientAddressForm } from '../../GiftRecipientAddressForm';
import { CheckoutFormData, PostalCodeSuggestion } from '../../../types/checkout';

interface ShippingStepContentProps {
  formData: CheckoutFormData;
  handleInputChange: (nameOrEvent: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, valueParam?: string) => void;
  postalSuggestions: PostalCodeSuggestion[];
  setPostalSuggestions: React.Dispatch<React.SetStateAction<PostalCodeSuggestion[]>>;
  giftOptionId: number | null;
  giftProductId: number | null;
  gifts: any[];
  setUseGiftRecipientAddress: React.Dispatch<React.SetStateAction<boolean>>;
  setGiftRecipientAddress: React.Dispatch<React.SetStateAction<any>>;
}

export const ShippingStepContent: React.FC<ShippingStepContentProps> = ({
  formData,
  handleInputChange,
  postalSuggestions,
  setPostalSuggestions,
  giftOptionId,
  giftProductId,
  gifts,
  setUseGiftRecipientAddress,
  setGiftRecipientAddress
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Street Address */}
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          {t('checkout.address', 'Street Address')}
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={(e) => handleInputChange(e)}
          required
          placeholder={t('checkout.form.addressPlaceholder', 'Slovenska cesta 1')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
        />
      </div>

      {/* City */}
      <div className="mb-4">
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          {t('checkout.city', 'City')}
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={(e) => handleInputChange(e)}
          required
          placeholder={t('checkout.form.cityPlaceholder', 'Ljubljana')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
        />
      </div>

      {/* Postal Code */}
      <div className="mb-4">
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
          {t('checkout.postalCode', 'Poštna številka')}
        </label>
        <div className="relative">
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleInputChange(e)}
            required
            maxLength={4}
            placeholder="1000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500 placeholder:text-gray-300"
          />
          {postalSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {postalSuggestions.map((suggestion) => (
                <button
                  key={suggestion.code}
                  type="button"
                  onClick={() => {
                    handleInputChange('postalCode', suggestion.code);
                    handleInputChange('city', suggestion.city);
                    setPostalSuggestions([]);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  {suggestion.code} - {suggestion.city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Country */}
      <div className="mb-4">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          {t('checkout.country', 'Country')}
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={(e) => handleInputChange(e)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
        >
          <option value="Slovenija">Slovenija</option>
          <option value="Hrvaška">Hrvaška</option>
          <option value="Avstrija">Avstrija</option>
        </select>
      </div>

      {/* Gift Recipient Address Form - only shown when there are gift items in the cart */}
      <GiftRecipientAddressForm
        hasGiftItems={giftOptionId !== null || giftProductId !== null || gifts.length > 0}
        onAddressChange={(useGiftAddress, address) => {
          setUseGiftRecipientAddress(useGiftAddress);
          setGiftRecipientAddress(address);
        }}
      />

      {/* Order Notes */}
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          {t('checkout.notes', 'Order Notes (optional)')}
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange(e)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
        />
      </div>
    </>
  );
};

export default ShippingStepContent;
