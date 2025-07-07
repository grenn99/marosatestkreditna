import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  compareTranslationCoverage, 
  highlightMissingTranslations,
  logMissingTranslations
} from '../../utils/translationDebug';

interface TranslationStatusProps {
  showControls?: boolean;
}

interface CoverageData {
  language: string;
  code: string;
  total: number;
  missing: number;
  coverage: number;
}

const languageNames: Record<string, string> = {
  'sl': 'Slovenian',
  'en': 'English',
  'hr': 'Croatian',
  'de': 'German'
};

export const TranslationStatus: React.FC<TranslationStatusProps> = ({ 
  showControls = true 
}) => {
  const { i18n } = useTranslation();
  const [coverageData, setCoverageData] = useState<CoverageData[]>([]);
  const [highlighting, setHighlighting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Calculate translation coverage on mount
  useEffect(() => {
    const calculateCoverage = () => {
      const coverage = compareTranslationCoverage();
      
      const data = Object.entries(coverage).map(([code, stats]) => ({
        language: languageNames[code] || code,
        code,
        ...stats
      }));
      
      // Sort by coverage (descending)
      data.sort((a, b) => b.coverage - a.coverage);
      
      setCoverageData(data);
    };
    
    calculateCoverage();
  }, []);

  // Toggle translation highlighting
  const toggleHighlighting = () => {
    const newState = !highlighting;
    highlightMissingTranslations(newState);
    setHighlighting(newState);
  };

  // Log missing translations for the current language
  const handleLogMissing = () => {
    logMissingTranslations();
  };

  // Change the current language
  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Translation Status"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">Translation Status</h3>
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
        
        {showControls && (
          <div className="flex flex-wrap gap-2 mt-2">
            {coverageData.map(item => (
              <button
                key={item.code}
                onClick={() => handleLanguageChange(item.code)}
                className={`px-2 py-1 text-xs rounded ${
                  i18n.language === item.code 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {item.language}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1">Coverage</h4>
        <div className="space-y-2">
          {coverageData.map(item => (
            <div key={item.code} className="flex items-center">
              <div className="w-24 text-sm">{item.language}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    item.coverage > 90 ? 'bg-green-500' :
                    item.coverage > 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${item.coverage}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs text-gray-600 w-16 text-right">
                {item.coverage}% ({item.missing})
              </div>
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleHighlighting}
            className={`px-3 py-1 text-xs rounded ${
              highlighting 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {highlighting ? 'Disable Highlighting' : 'Highlight Missing'}
          </button>
          
          <button
            onClick={handleLogMissing}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Log Missing Keys
          </button>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        <p>This component only appears in development mode</p>
      </div>
    </div>
  );
};

export default TranslationStatus;
