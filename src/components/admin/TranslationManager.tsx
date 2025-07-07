import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import translationService from '../../services/translationService';
import { getMissingTranslations } from '../../utils/translationHelpers';

interface TranslationManagerProps {
  section?: string; // Optional section to filter translations
}

interface TranslationItem {
  id: string;
  key: string;
  values: {
    [lang: string]: string;
  };
  section: string;
  status: 'complete' | 'partial' | 'missing';
}

export const TranslationManager: React.FC<TranslationManagerProps> = ({ section }) => {
  const { t, i18n } = useTranslation();
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<string>('');
  const [newSection, setNewSection] = useState<string>('general');
  const [newValues, setNewValues] = useState<Record<string, string>>({
    sl: '',
    en: '',
    hr: '',
    de: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const supportedLanguages = [
    { code: 'sl', name: 'Slovenščina' },
    { code: 'en', name: 'English' },
    { code: 'hr', name: 'Hrvatski' },
    { code: 'de', name: 'Deutsch' },
  ];

  // Fetch translations from the database
  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch translations using the translation service
        const data = await translationService.getAllTranslations();

        // Process the data
        const processedData: TranslationItem[] = data.map((item: any) => {
          // Determine status
          const hasAllLanguages = supportedLanguages.every(lang =>
            item[lang.code] && item[lang.code].trim() !== ''
          );
          const hasSomeLanguages = supportedLanguages.some(lang =>
            item[lang.code] && item[lang.code].trim() !== ''
          );

          const status = hasAllLanguages
            ? 'complete'
            : hasSomeLanguages
              ? 'partial'
              : 'missing';

          return {
            id: item.id,
            key: item.key,
            values: supportedLanguages.reduce((acc, lang) => {
              acc[lang.code] = item[lang.code] || '';
              return acc;
            }, {} as Record<string, string>),
            section: item.section || 'general',
            status
          };
        });

        setTranslations(processedData);
      } catch (err: any) {
        console.error('Error fetching translations:', err);
        setError(err.message || 'Failed to load translations');
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  // Filter translations based on current filters
  const filteredTranslations = translations
    .filter(item => {
      // Filter by section if provided
      if (section && item.section !== section) return false;

      // Filter by status
      if (filter === 'missing' && item.status !== 'missing') return false;
      if (filter === 'partial' && item.status !== 'partial') return false;
      if (filter === 'complete' && item.status !== 'complete') return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.key.toLowerCase().includes(query) ||
          Object.values(item.values).some(val =>
            val.toLowerCase().includes(query)
          )
        );
      }

      return true;
    });

  // Handle saving a translation
  const handleSaveTranslation = async (key: string, language: string, value: string) => {
    setSaving(true);

    try {
      // Update the translation using the translation service
      await translationService.updateTranslation({
        key,
        language,
        value
      });

      // Update local state
      setTranslations(prev =>
        prev.map(item => {
          if (item.key === key) {
            const newValues = { ...item.values, [language]: value };

            // Recalculate status
            const hasAllLanguages = supportedLanguages.every(lang =>
              newValues[lang.code] && newValues[lang.code].trim() !== ''
            );
            const hasSomeLanguages = supportedLanguages.some(lang =>
              newValues[lang.code] && newValues[lang.code].trim() !== ''
            );

            const status = hasAllLanguages
              ? 'complete'
              : hasSomeLanguages
                ? 'partial'
                : 'missing';

            return {
              ...item,
              values: newValues,
              status
            };
          }
          return item;
        })
      );

      // Reset editing state
      setEditingKey(null);
      setEditValue('');
    } catch (err: any) {
      console.error('Error saving translation:', err);
      alert('Failed to save translation: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle adding a new translation
  const handleAddTranslation = async () => {
    if (!newKey.trim()) {
      alert('Translation key is required');
      return;
    }

    setSaving(true);

    try {
      // Add the translation using the translation service
      await translationService.addTranslation(newKey, newSection, newValues);

      // Refresh translations
      const data = await translationService.getAllTranslations();

      // Process the data
      const processedData: TranslationItem[] = data.map((item: any) => {
        // Determine status
        const hasAllLanguages = supportedLanguages.every(lang =>
          item[lang.code] && item[lang.code].trim() !== ''
        );
        const hasSomeLanguages = supportedLanguages.some(lang =>
          item[lang.code] && item[lang.code].trim() !== ''
        );

        const status = hasAllLanguages
          ? 'complete'
          : hasSomeLanguages
            ? 'partial'
            : 'missing';

        return {
          id: item.id,
          key: item.key,
          values: supportedLanguages.reduce((acc, lang) => {
            acc[lang.code] = item[lang.code] || '';
            return acc;
          }, {} as Record<string, string>),
          section: item.section || 'general',
          status
        };
      });

      setTranslations(processedData);

      // Reset form
      setNewKey('');
      setNewSection('general');
      setNewValues({
        sl: '',
        en: '',
        hr: '',
        de: ''
      });
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error adding translation:', err);
      alert('Failed to add translation: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting a translation
  const handleDeleteTranslation = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the translation for "${key}"?`)) {
      return;
    }

    try {
      // Delete the translation using the translation service
      await translationService.deleteTranslation(key);

      // Update local state
      setTranslations(prev => prev.filter(item => item.key !== key));
    } catch (err: any) {
      console.error('Error deleting translation:', err);
      alert('Failed to delete translation: ' + err.message);
    }
  };

  // Start editing a translation
  const startEditing = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (loading) {
    return <div className="p-4">Loading translations...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Translation Manager</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="all">All</option>
            <option value="missing">Missing</option>
            <option value="partial">Partial</option>
            <option value="complete">Complete</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search translations..."
            className="border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="ml-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mt-5"
          >
            {showAddForm ? 'Cancel' : 'Add New Translation'}
          </button>
        </div>
      </div>

      {/* Add Translation Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Translation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g., common.button.save"
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use dot notation for nested keys (e.g., common.button.save)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                type="text"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="e.g., common, checkout, product"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {supportedLanguages.map(lang => (
              <div key={lang.code}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {lang.name}
                </label>
                <textarea
                  value={newValues[lang.code] || ''}
                  onChange={(e) => setNewValues(prev => ({
                    ...prev,
                    [lang.code]: e.target.value
                  }))}
                  placeholder={`Translation in ${lang.name}`}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddTranslation}
              disabled={saving || !newKey.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Adding...' : 'Add Translation'}
            </button>
          </div>
        </div>
      )}

      {/* Translations Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Key</th>
              <th className="py-2 px-4 border-b text-left">Section</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Translation</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                  No translations found matching your criteria
                </td>
              </tr>
            ) : (
              filteredTranslations.map(item => (
                <tr key={item.key} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b font-mono text-sm">{item.key}</td>
                  <td className="py-2 px-4 border-b">{item.section}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      item.status === 'complete' ? 'bg-green-100 text-green-800' :
                      item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingKey === item.key ? (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                        rows={3}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {item.values[selectedLanguage] || (
                          <span className="text-gray-400 italic">No translation</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingKey === item.key ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveTranslation(item.key, selectedLanguage, editValue)}
                          disabled={saving}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(item.key, item.values[selectedLanguage] || '')}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTranslation(item.key)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination or Load More could be added here */}

      <div className="mt-6 text-sm text-gray-500">
        <p>Total translations: {translations.length}</p>
        <p>Showing: {filteredTranslations.length}</p>
        <p>Missing translations: {translations.filter(t => t.status === 'missing').length}</p>
        <p>Partial translations: {translations.filter(t => t.status === 'partial').length}</p>
        <p>Complete translations: {translations.filter(t => t.status === 'complete').length}</p>
      </div>
    </div>
  );
};

export default TranslationManager;
