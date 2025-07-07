// Script to update gift package translations in the database
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateGiftPackageTranslations() {
  console.log('Updating gift package translations...');

  try {
    // Update the first package (Osnovno darilo / Basic Gift)
    const { data: data1, error: error1 } = await supabase
      .from('gift_packages')
      .update({
        name_de: 'Basis-Geschenk',
        name_hr: 'Osnovni poklon',
        description_de: 'Basis-Geschenkverpackung mit einem Produkt Ihrer Wahl.',
        description_hr: 'Osnovno poklon pakiranje s jednim proizvodom po vašem izboru.'
      })
      .eq('id', 1);

    if (error1) {
      console.error('Error updating package 1:', error1);
    } else {
      console.log('Package 1 updated successfully');
    }

    // Update the second package (Premium darilo / Premium Gift)
    const { data: data2, error: error2 } = await supabase
      .from('gift_packages')
      .update({
        name_de: 'Premium-Geschenk',
        name_hr: 'Premium poklon',
        description_de: 'Elegante Geschenkverpackung mit bis zu drei Produkten Ihrer Wahl.',
        description_hr: 'Elegantno poklon pakiranje s do tri proizvoda po vašem izboru.'
      })
      .eq('id', 2);

    if (error2) {
      console.error('Error updating package 2:', error2);
    } else {
      console.log('Package 2 updated successfully');
    }

    // Update the third package (Luksuzno darilo / Luxury Gift)
    const { data: data3, error: error3 } = await supabase
      .from('gift_packages')
      .update({
        name_de: 'Luxus-Geschenk',
        name_hr: 'Luksuzni poklon',
        description_de: 'Luxuriöse Geschenkbox mit bis zu fünf Produkten Ihrer Wahl und einer personalisierten Karte.',
        description_hr: 'Luksuzna poklon kutija s do pet proizvoda po vašem izboru i personaliziranom karticom.'
      })
      .eq('id', 3);

    if (error3) {
      console.error('Error updating package 3:', error3);
    } else {
      console.log('Package 3 updated successfully');
    }

    console.log('Gift package translations update completed');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the update function
updateGiftPackageTranslations();
