import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Heart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface GiftOption {
  id: number;
  name: string;
  name_en?: string;
  name_de?: string;
  name_hr?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  description_hr?: string;
  price: number;
  image_url?: string;
}

interface GiftForFriendsOptionProps {
  onSelect: (giftOptionId: number | null, giftMessage: string) => void;
}

export function GiftForFriendsOption({ onSelect }: GiftForFriendsOptionProps) {
  const { t, i18n } = useTranslation();
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGiftOptions();
  }, []);

  const fetchGiftOptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gift_options')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      setGiftOptions(data || []);
    } catch (err: any) {
      console.error('Error fetching gift options:', err);
      setError(t('checkout.giftOptions.fetchError', 'Failed to load gift options'));
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId: number | null) => {
    setSelectedOption(optionId);
    onSelect(optionId, giftMessage);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGiftMessage(e.target.value);
    onSelect(selectedOption, e.target.value);
  };

  const getTranslatedName = (option: GiftOption) => {
    const lang = i18n.language;
    if (lang === 'en' && option.name_en) return option.name_en;
    if (lang === 'de' && option.name_de) return option.name_de;
    if (lang === 'hr' && option.name_hr) return option.name_hr;
    return option.name;
  };

  const getTranslatedDescription = (option: GiftOption) => {
    const lang = i18n.language;
    if (lang === 'en' && option.description_en) return option.description_en;
    if (lang === 'de' && option.description_de) return option.description_de;
    if (lang === 'hr' && option.description_hr) return option.description_hr;
    return option.description || '';
  };

  if (loading) {
    return <div className="py-4">{t('checkout.giftOptions.loading', 'Loading gift options...')}</div>;
  }

  if (error) {
    return null; // Hide error message
  }

  if (giftOptions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border border-amber-200 rounded-lg p-4 bg-amber-50">
      <div className="flex items-center mb-4">
        <Gift className="w-5 h-5 text-amber-600 mr-2" />
        <h3 className="text-lg font-medium text-amber-800">
          {t('checkout.giftOptions.title', 'Gift Options')}
        </h3>
      </div>

      <p className="text-amber-700 mb-4">
        {t('checkout.giftOptions.description', 'Make your order special with our gift options')}
      </p>

      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="radio"
            id="gift-option-none"
            name="gift-option"
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
            checked={selectedOption === null}
            onChange={() => handleOptionSelect(null)}
          />
          <label htmlFor="gift-option-none" className="ml-2 block text-gray-700">
            {t('checkout.giftOptions.none', 'No gift packaging')}
          </label>
        </div>

        {giftOptions.map((option) => (
          <div key={option.id} className="flex items-start">
            <input
              type="radio"
              id={`gift-option-${option.id}`}
              name="gift-option"
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 mt-1"
              checked={selectedOption === option.id}
              onChange={() => handleOptionSelect(option.id)}
            />
            <label htmlFor={`gift-option-${option.id}`} className="ml-2 block">
              <div className="flex items-center">
                <span className="text-gray-700 font-medium">{getTranslatedName(option)}</span>
                <span className="ml-2 text-amber-600 text-sm">+{option.price.toFixed(2)} €</span>
              </div>
              {getTranslatedDescription(option) && (
                <span className="text-gray-500 text-sm block mt-1">
                  {getTranslatedDescription(option)}
                </span>
              )}
            </label>
          </div>
        ))}
      </div>

      {selectedOption !== null && (
        <div className="mt-4">
          <label htmlFor="gift-message" className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center">
              <Heart className="w-4 h-4 text-pink-500 mr-1" />
              {t('checkout.giftOptions.message', 'Add a personal message')}
            </div>
          </label>
          <textarea
            id="gift-message"
            rows={3}
            className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder={t('checkout.giftOptions.messagePlaceholder', 'Your personal message...')}
            value={giftMessage}
            onChange={handleMessageChange}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {giftMessage.length}/200 {t('checkout.giftOptions.characters', 'characters')}
          </p>
        </div>
      )}
    </div>
  );
}
