import { supabase } from '../lib/supabaseClient';
import i18n from '../i18n';
import { loadLanguageAsync } from '../i18n/lazyLoad';

interface TranslationRecord {
  id: string;
  key: string;
  section: string;
  sl: string | null;
  en: string | null;
  hr: string | null;
  de: string | null;
  created_at: string;
  updated_at: string;
}

interface TranslationUpdate {
  key: string;
  language: string;
  value: string;
}

/**
 * Service for managing translations
 */
export const translationService = {
  /**
   * Load translations for a specific language
   * @param language The language code to load
   */
  async loadTranslations(language: string): Promise<void> {
    try {
      // First try to load from local storage cache
      const cachedTranslations = this.getCachedTranslations(language);
      if (cachedTranslations) {
        // Add translations to i18next
        i18n.addResourceBundle(language, 'translation', cachedTranslations, true, true);
        console.log(`Loaded cached translations for ${language}`);
      }
      
      // Then load from the server if we're online
      if (navigator.onLine) {
        await this.fetchAndUpdateTranslations(language);
      }
      
      // Finally, load the static translations as a fallback
      await loadLanguageAsync(language);
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error);
      // Fall back to static translations
      await loadLanguageAsync(language);
    }
  },
  
  /**
   * Fetch translations from the server and update the cache
   * @param language The language code to fetch
   */
  async fetchAndUpdateTranslations(language: string): Promise<void> {
    try {
      // Fetch translations from Supabase
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('key');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Process the data into a nested structure
        const processedData = this.processTranslationsData(data, language);
        
        // Add to i18next
        i18n.addResourceBundle(language, 'translation', processedData, true, true);
        
        // Update cache
        this.cacheTranslations(language, processedData);
        
        console.log(`Updated translations for ${language} from server`);
      }
    } catch (error) {
      console.error(`Failed to fetch translations for ${language}:`, error);
      throw error;
    }
  },
  
  /**
   * Process flat translation records into a nested structure
   * @param data Array of translation records
   * @param language The language code to process
   */
  processTranslationsData(data: TranslationRecord[], language: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    data.forEach(record => {
      // Get the value for the requested language
      const value = record[language as keyof TranslationRecord] as string | null;
      
      // Skip if no translation exists
      if (!value) return;
      
      // Split the key into parts (e.g., 'common.save' -> ['common', 'save'])
      const keyParts = record.key.split('.');
      
      // Build the nested structure
      let current = result;
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value at the leaf node
      current[keyParts[keyParts.length - 1]] = value;
    });
    
    return result;
  },
  
  /**
   * Cache translations in local storage
   * @param language The language code
   * @param translations The translations object
   */
  cacheTranslations(language: string, translations: Record<string, any>): void {
    try {
      localStorage.setItem(`translations_${language}`, JSON.stringify(translations));
      localStorage.setItem(`translations_${language}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache translations:', error);
    }
  },
  
  /**
   * Get cached translations from local storage
   * @param language The language code
   * @returns The cached translations or null if not found or expired
   */
  getCachedTranslations(language: string): Record<string, any> | null {
    try {
      const cached = localStorage.getItem(`translations_${language}`);
      const timestamp = localStorage.getItem(`translations_${language}_timestamp`);
      
      if (!cached || !timestamp) return null;
      
      // Check if cache is expired (24 hours)
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      const cacheAge = now - cacheTime;
      const cacheMaxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cacheAge > cacheMaxAge) {
        // Cache is expired
        return null;
      }
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to get cached translations:', error);
      return null;
    }
  },
  
  /**
   * Update a translation
   * @param update The translation update object
   */
  async updateTranslation(update: TranslationUpdate): Promise<void> {
    try {
      const { key, language, value } = update;
      
      // Update in Supabase
      const { error } = await supabase
        .from('translations')
        .update({ [language]: value })
        .eq('key', key);
      
      if (error) throw error;
      
      // Update in i18next
      const keyParts = key.split('.');
      const namespace = 'translation';
      
      // Build the path for i18next
      let path = '';
      for (let i = 0; i < keyParts.length; i++) {
        path += keyParts[i];
        if (i < keyParts.length - 1) {
          path += '.';
        }
      }
      
      // Add the translation to i18next
      i18n.addResource(language, namespace, path, value);
      
      // Update cache
      const cachedTranslations = this.getCachedTranslations(language) || {};
      let current = cachedTranslations;
      
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[keyParts[keyParts.length - 1]] = value;
      
      this.cacheTranslations(language, cachedTranslations);
      
      console.log(`Updated translation for ${key} in ${language}`);
    } catch (error) {
      console.error('Failed to update translation:', error);
      throw error;
    }
  },
  
  /**
   * Get all translations
   */
  async getAllTranslations(): Promise<TranslationRecord[]> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('key');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get all translations:', error);
      throw error;
    }
  },
  
  /**
   * Add a new translation
   * @param key The translation key
   * @param section The section
   * @param translations The translations for each language
   */
  async addTranslation(
    key: string,
    section: string = 'general',
    translations: Record<string, string> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('translations')
        .insert({
          key,
          section,
          ...translations
        });
      
      if (error) throw error;
      
      // Update in i18next for each language
      Object.entries(translations).forEach(([language, value]) => {
        if (value) {
          i18n.addResource(language, 'translation', key, value);
        }
      });
      
      console.log(`Added new translation for ${key}`);
    } catch (error) {
      console.error('Failed to add translation:', error);
      throw error;
    }
  },
  
  /**
   * Delete a translation
   * @param key The translation key to delete
   */
  async deleteTranslation(key: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('key', key);
      
      if (error) throw error;
      
      // Remove from i18next for all languages
      const languages = i18n.languages || [];
      languages.forEach(language => {
        i18n.removeResource(language, 'translation', key);
      });
      
      console.log(`Deleted translation for ${key}`);
    } catch (error) {
      console.error('Failed to delete translation:', error);
      throw error;
    }
  }
};

export default translationService;
