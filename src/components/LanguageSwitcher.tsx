import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'sl', name: 'Slovenščina' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Change the language
    i18n.changeLanguage(langCode);
    setIsOpen(false);

    // Update URL with new language parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('lang', langCode);
    navigate(`${location.pathname}?${searchParams.toString()}`);

    // Log for debugging
    console.log(`Language changed to: ${langCode}`);
    console.log(`Current i18n language: ${i18n.language}`);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">
          {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                i18n.language === lang.code ? 'text-amber-600 font-medium' : 'text-gray-700'
              }`}
              type="button"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
