import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function UpdateGiftTranslations() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTranslations = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      setError(null);

      // Update the first package (Osnovno darilo / Basic Gift)
      const { error: error1 } = await supabase
        .from('gift_packages')
        .update({
          name_de: 'Basis-Geschenk',
          name_hr: 'Osnovni poklon',
          description_de: 'Basis-Geschenkverpackung mit einem Produkt Ihrer Wahl.',
          description_hr: 'Osnovno poklon pakiranje s jednim proizvodom po vašem izboru.'
        })
        .eq('id', 1);

      if (error1) throw error1;

      // Update the second package (Premium darilo / Premium Gift)
      const { error: error2 } = await supabase
        .from('gift_packages')
        .update({
          name_de: 'Premium-Geschenk',
          name_hr: 'Premium poklon',
          description_de: 'Elegante Geschenkverpackung mit bis zu drei Produkten Ihrer Wahl.',
          description_hr: 'Elegantno poklon pakiranje s do tri proizvoda po vašem izboru.'
        })
        .eq('id', 2);

      if (error2) throw error2;

      // Update the third package (Luksuzno darilo / Luxury Gift)
      const { error: error3 } = await supabase
        .from('gift_packages')
        .update({
          name_de: 'Luxus-Geschenk',
          name_hr: 'Luksuzni poklon',
          description_de: 'Luxuriöse Geschenkbox mit bis zu fünf Produkten Ihrer Wahl und einer personalisierten Karte.',
          description_hr: 'Luksuzna poklon kutija s do pet proizvoda po vašem izboru i personaliziranom karticom.'
        })
        .eq('id', 3);

      if (error3) throw error3;

      setSuccess(true);
    } catch (err: any) {
      console.error('Error updating translations:', err);
      setError(err.message || 'An error occurred while updating translations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Update Gift Package Translations</h2>
      <p className="mb-4">
        This will update the German and Croatian translations for all gift packages.
      </p>
      <button
        onClick={updateTranslations}
        disabled={loading}
        className={`px-4 py-2 rounded-md ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Updating...' : 'Update Translations'}
      </button>
      {success && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md">
          Translations updated successfully!
        </div>
      )}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
          Error: {error}
        </div>
      )}
    </div>
  );
}
