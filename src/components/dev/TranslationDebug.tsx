import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslationDebugProps {
  showDetails?: boolean;
}

const TranslationDebug: React.FC<TranslationDebugProps> = ({ showDetails = true }) => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [testKeys, setTestKeys] = useState<Record<string, boolean>>({
    'common.save': false,
    'common.cancel': false,
    'common.edit': false,
    'common.delete': false,
    'common.back': false,
    'nav.about': false,
    'nav.products': false,
    'nav.location': false,
    'nav.recipes': false,
    'nav.cart': false,
  });

  // Check if translations exist
  useEffect(() => {
    const updatedKeys = { ...testKeys };
    
    Object.keys(updatedKeys).forEach(key => {
      try {
        const translation = t(key);
        updatedKeys[key] = translation !== key;
      } catch (error) {
        updatedKeys[key] = false;
      }
    });
    
    setTestKeys(updatedKeys);
  }, [t, i18n.language]);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Translation Debug"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">Translation Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="text-sm mb-3">
        <p className="text-gray-600 mb-1">Current language: <span className="font-medium">{i18n.language}</span></p>
        <p className="text-gray-600 mb-1">Available languages: <span className="font-medium">{i18n.languages?.join(', ')}</span></p>
      </div>

      {showDetails && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-700 mb-1">Test Translations</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(testKeys).map(([key, exists]) => (
              <div key={key} className="flex items-center">
                <span className={`w-4 h-4 rounded-full mr-2 ${exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-mono">{key}</span>
                <span className="mx-2">=&gt;</span>
                <span className={exists ? 'text-green-600' : 'text-red-600'}>
                  {exists ? t(key) : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {i18n.languages?.map(lang => (
          <button
            key={lang}
            onClick={() => i18n.changeLanguage(lang)}
            className={`px-3 py-1 text-xs rounded ${
              i18n.language === lang 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>This component only appears in development mode</p>
      </div>
    </div>
  );
};

export default TranslationDebug;
