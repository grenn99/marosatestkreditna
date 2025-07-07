# Translation System Documentation

This document provides an overview of the translation and localization system implemented in the project.

## Overview

The translation system has been redesigned to be more maintainable, performant, and user-friendly. Key features include:

- Structured translation files organized by language
- Lazy loading of translations to improve performance
- Database storage for dynamic translation management
- Admin interface for managing translations
- Developer tools for identifying and fixing translation issues

## Supported Languages

The system currently supports the following languages:

- Slovenian (sl) - Primary/default language
- English (en)
- Croatian (hr)
- German (de)

## Directory Structure

```
src/
├── i18n/
│   ├── index.ts                # Main i18n configuration
│   ├── lazyLoad.ts             # Lazy loading implementation
│   └── languages/
│       ├── sl.ts               # Slovenian translations
│       ├── en.ts               # English translations
│       ├── hr.ts               # Croatian translations
│       └── de.ts               # German translations
├── services/
│   └── translationService.ts   # Service for managing translations
├── utils/
│   ├── translationHelpers.ts   # Helper functions for translations
│   └── translationDebug.ts     # Debugging tools for translations
└── components/
    ├── admin/
    │   └── TranslationManager.tsx  # Admin interface for translations
    └── dev/
        └── TranslationStatus.tsx   # Developer tool for translation status
```

## Database Schema

Translations are stored in a `translations` table with the following schema:

```sql
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  section TEXT NOT NULL DEFAULT 'general',
  sl TEXT,
  en TEXT,
  hr TEXT,
  de TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### 1. Apply Database Migration

Run the migration script to create the translations table:

```bash
./scripts/apply-translations-migration.sh
```

You will be prompted for database connection details if the `SUPABASE_DB_URL` environment variable is not set.

### 2. Verify Installation

After applying the migration, you should be able to:

- Access the translation manager at `/admin/translations`
- See the translation status component in development mode
- Switch between languages using the language switcher

## Usage Guide

### For Developers

#### Adding New Translations

1. **Static Translations**

   Add new translations to the appropriate language file in `src/i18n/languages/`:

   ```typescript
   // src/i18n/languages/en.ts
   export const english = {
     common: {
       // Add new translations here
       newKey: 'New translation'
     }
   };
   ```

2. **Dynamic Translations**

   Use the Translation Manager interface at `/admin/translations` to add new translations.

#### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
}
```

#### Translation Helpers

Use the helper functions for common translation tasks:

```tsx
import { getTranslatedField, formatPrice, formatDate } from '../utils/translationHelpers';

// Get a translated field from a product
const productName = getTranslatedField(product, 'name');

// Format a price according to the current language
const formattedPrice = formatPrice(19.99);

// Format a date according to the current language
const formattedDate = formatDate(new Date());
```

#### Debugging Translations

In development mode, use the TranslationStatus component to:

- See translation coverage for each language
- Highlight missing translations
- Log missing translation keys to the console

### For Administrators

#### Managing Translations

1. Navigate to `/admin/translations`
2. Use the filters to find specific translations
3. Edit translations for different languages
4. Add new translations with the "Add New Translation" button
5. Delete translations that are no longer needed

## Best Practices

1. **Use Namespaced Keys**

   Use dot notation to organize translations hierarchically:

   ```
   common.buttons.save
   checkout.form.address
   product.details.description
   ```

2. **Group Related Translations**

   Use the `section` field to group related translations:

   ```
   common, checkout, product, admin
   ```

3. **Provide Context**

   Add comments or use descriptive keys to provide context for translators:

   ```
   // This is shown on the checkout button
   checkout.button.complete: 'Complete Order'
   ```

4. **Test All Languages**

   Regularly test the application in all supported languages to ensure a consistent experience.

5. **Keep Translations Up to Date**

   Update translations when adding new features or changing existing ones.

## Troubleshooting

### Missing Translations

If translations are missing:

1. Check the TranslationStatus component in development mode
2. Look for console warnings about missing translations
3. Add the missing translations using the Translation Manager

### Database Connection Issues

If you encounter database connection issues:

1. Verify that your Supabase instance is running
2. Check the database connection details
3. Ensure that the RLS policies are correctly applied

### Performance Issues

If you experience performance issues:

1. Ensure that lazy loading is working correctly
2. Check for unnecessary re-renders when using translations
3. Consider splitting large translation files into smaller chunks

## Future Improvements

- Add support for additional languages (Italian, Hungarian)
- Implement a professional translation workflow
- Add support for pluralization and formatting
- Improve caching and offline support

## Contributing

When contributing to the translation system:

1. Follow the established naming conventions
2. Update documentation when making changes
3. Test changes in all supported languages
4. Consider the impact on performance and maintainability
