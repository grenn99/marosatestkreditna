import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Settings, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always required
  functional: false,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply preferences
    applyCookiePreferences(prefs);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Clear non-essential cookies if not consented
    if (!prefs.functional) {
      // Remove functional cookies
      localStorage.removeItem('welcome_discount_shown');
      localStorage.removeItem('welcome_discount_temp_hidden');
      localStorage.removeItem('welcome_discount_temp_hidden_until');
    }

    if (!prefs.analytics) {
      // Remove analytics cookies/data
      // Add analytics cleanup here if you use Google Analytics, etc.
    }

    if (!prefs.marketing) {
      // Remove marketing cookies/data
      // Add marketing cleanup here
    }

    // Dispatch event for other components to react to preference changes
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', { detail: prefs }));
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessaryOnly = () => {
    savePreferences(DEFAULT_PREFERENCES);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-brown-600 shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-brown-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('cookies.banner.title', 'Uporabljamo piškotke')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('cookies.banner.description', 'Uporabljamo piškotke za izboljšanje vaše izkušnje. Nekateri so potrebni za delovanje strani, drugi pa nam pomagajo razumeti, kako uporabljate našo spletno stran.')}
                  {' '}
                  <Link to="/privacy-policy" className="text-brown-600 hover:underline">
                    {t('cookies.banner.learnMore', 'Več o zasebnosti')}
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-brown-600 text-brown-600 rounded-md hover:bg-brown-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('cookies.banner.settings', 'Nastavitve')}
              </button>
              <button
                onClick={acceptNecessaryOnly}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('cookies.banner.necessary', 'Samo potrebni')}
              </button>
              <button
                onClick={acceptAll}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                {t('cookies.banner.acceptAll', 'Sprejmi vse')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  {t('cookies.settings.title', 'Nastavitve piškotkov')}
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{t('cookies.necessary.title', 'Potrebni piškotki')}</h3>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {t('cookies.necessary.required', 'Obvezni')}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t('cookies.necessary.description', 'Ti piškotki so potrebni za osnovno delovanje spletne strani in jih ni mogoče onemogočiti.')}
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{t('cookies.functional.title', 'Funkcionalni piškotki')}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-600"></div>
                    </label>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t('cookies.functional.description', 'Ti piškotki omogočajo izboljšane funkcionalnosti in personalizacijo (npr. jezikovne preference, košarica).')}
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{t('cookies.analytics.title', 'Analitični piškotki')}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-600"></div>
                    </label>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t('cookies.analytics.description', 'Ti piškotki nam pomagajo razumeti, kako obiskovalci uporabljajo spletno stran, da jo lahko izboljšamo.')}
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{t('cookies.marketing.title', 'Trženjski piškotki')}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-600"></div>
                    </label>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t('cookies.marketing.description', 'Ti piškotki se uporabljajo za prikazovanje relevantnih oglasov in merjenje učinkovitosti marketinških kampanj.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => savePreferences(preferences)}
                  className="flex-1 bg-brown-600 text-white py-3 px-6 rounded-md hover:bg-brown-700 transition-colors"
                >
                  {t('cookies.settings.save', 'Shrani nastavitve')}
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 border border-brown-600 text-brown-600 py-3 px-6 rounded-md hover:bg-brown-50 transition-colors"
                >
                  {t('cookies.settings.acceptAll', 'Sprejmi vse')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
