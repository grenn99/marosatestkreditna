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

-- Allow admin write access
CREATE POLICY "Allow admin write access to translations" 
  ON translations FOR ALL 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

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

-- Create function to export translations as JSON
CREATE OR REPLACE FUNCTION get_translations_json(lang_code TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_object_agg(key, t.lang_value)
  INTO result
  FROM (
    SELECT 
      key,
      CASE 
        WHEN lang_code = 'sl' THEN sl
        WHEN lang_code = 'en' THEN en
        WHEN lang_code = 'hr' THEN hr
        WHEN lang_code = 'de' THEN de
        ELSE NULL
      END as lang_value
    FROM translations
    WHERE 
      CASE 
        WHEN lang_code = 'sl' THEN sl IS NOT NULL
        WHEN lang_code = 'en' THEN en IS NOT NULL
        WHEN lang_code = 'hr' THEN hr IS NOT NULL
        WHEN lang_code = 'de' THEN de IS NOT NULL
        ELSE false
      END
  ) t;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
