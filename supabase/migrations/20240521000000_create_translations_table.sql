-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
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

-- Add RLS policies
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to translations"
  ON translations FOR SELECT
  USING (true);

-- Allow authenticated users write access
-- Note: In a production environment, you should restrict this to admin users
-- This simplified policy allows any authenticated user to modify translations
CREATE POLICY "Allow authenticated users write access to translations"
  ON translations FOR ALL
  USING (auth.role() = 'authenticated');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION update_translations_updated_at();

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS translations_key_idx ON translations (key);
CREATE INDEX IF NOT EXISTS translations_section_idx ON translations (section);

-- Insert some initial translations for testing
INSERT INTO translations (key, section, sl, en, hr, de) VALUES
('common.save', 'common', 'Shrani', 'Save', 'Spremi', 'Speichern'),
('common.cancel', 'common', 'Prekliči', 'Cancel', 'Odustani', 'Abbrechen'),
('common.edit', 'common', 'Uredi', 'Edit', 'Uredi', 'Bearbeiten'),
('common.delete', 'common', 'Izbriši', 'Delete', 'Izbriši', 'Löschen'),
('common.back', 'common', 'Nazaj', 'Back', 'Natrag', 'Zurück'),
('common.continue', 'common', 'Nadaljuj', 'Continue', 'Nastavi', 'Weiter'),
('common.submit', 'common', 'Potrdi', 'Submit', 'Potvrdi', 'Absenden'),
('common.required', 'common', 'Obvezno polje', 'Required field', 'Obavezno polje', 'Pflichtfeld'),
('admin.navigation.translations', 'admin', 'Prevodi', 'Translations', 'Prijevodi', 'Übersetzungen')
ON CONFLICT (key) DO UPDATE SET
  sl = EXCLUDED.sl,
  en = EXCLUDED.en,
  hr = EXCLUDED.hr,
  de = EXCLUDED.de,
  updated_at = NOW();
