-- Create meta_tags table for SEO management
CREATE TABLE IF NOT EXISTS meta_tags (
  id SERIAL PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2),
  min_order_amount DECIMAL(10, 2),
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_options table
CREATE TABLE IF NOT EXISTS gift_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  name_hr TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  description_hr TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_bundles table
CREATE TABLE IF NOT EXISTS product_bundles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_de TEXT,
  name_hr TEXT,
  description TEXT,
  description_en TEXT,
  description_de TEXT,
  description_hr TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_bundle_items table
CREATE TABLE IF NOT EXISTS product_bundle_items (
  id SERIAL PRIMARY KEY,
  bundle_id INTEGER NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  package_option_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bundle_id, product_id, package_option_id)
);

-- Add gift_option_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_option_id INTEGER REFERENCES gift_options(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message TEXT;

-- Add discount_code_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code_id INTEGER REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 10,
  uses INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referral_code_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_code_id INTEGER REFERENCES referral_codes(id);

-- Add RLS policies
ALTER TABLE meta_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for meta_tags
CREATE POLICY "Meta tags are viewable by everyone" ON meta_tags
  FOR SELECT USING (true);

CREATE POLICY "Meta tags are editable by admins only" ON meta_tags
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create policies for discount_codes
CREATE POLICY "Discount codes are viewable by everyone" ON discount_codes
  FOR SELECT USING (true);

CREATE POLICY "Discount codes are editable by admins only" ON discount_codes
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create policies for gift_options
CREATE POLICY "Gift options are viewable by everyone" ON gift_options
  FOR SELECT USING (true);

CREATE POLICY "Gift options are editable by admins only" ON gift_options
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE
      raw_user_meta_data->>'is_admin' = 'true' OR
      email IN ('admin@example.com', 'nakupi@si.si')
    )
  );

-- Create policies for product_bundles
CREATE POLICY "Product bundles are viewable by everyone" ON product_bundles
  FOR SELECT USING (true);

CREATE POLICY "Product bundles are editable by admins only" ON product_bundles
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create policies for product_bundle_items
CREATE POLICY "Product bundle items are viewable by everyone" ON product_bundle_items
  FOR SELECT USING (true);

CREATE POLICY "Product bundle items are editable by admins only" ON product_bundle_items
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create policies for newsletter_subscribers
CREATE POLICY "Newsletter subscribers are viewable by admins only" ON newsletter_subscribers
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Newsletter subscribers are editable by admins only" ON newsletter_subscribers
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Newsletter subscribers are deletable by admins only" ON newsletter_subscribers
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create policies for referral_codes
CREATE POLICY "Referral codes are viewable by their owners and admins" ON referral_codes
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Referral codes are editable by admins only" ON referral_codes
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Referral codes are insertable by their owners and admins" ON referral_codes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Referral codes are deletable by admins only" ON referral_codes
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Create sample gift options
INSERT INTO gift_options (name, name_en, name_de, name_hr, description, description_en, description_de, description_hr, price, is_active)
VALUES
('Darilna embalaža', 'Gift Wrapping', 'Geschenkverpackung', 'Poklon pakiranje', 'Lepo zavito v darilni papir s pentljo', 'Beautifully wrapped in gift paper with a bow', 'Schön in Geschenkpapier mit Schleife verpackt', 'Lijepo zamotano u poklon papir s mašnom', 2.50, true),
('Darilo za prijatelje', 'Gift for Friends', 'Geschenk für Freunde', 'Poklon za prijatelje', 'Posebna embalaža z osebnim sporočilom', 'Special packaging with a personal message', 'Spezielle Verpackung mit persönlicher Nachricht', 'Posebno pakiranje s osobnom porukom', 3.50, true);

-- Create sample discount codes
INSERT INTO discount_codes (code, discount_percent, valid_from, valid_to, is_active)
VALUES
('WELCOME10', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('SUMMER2023', 15, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true);

-- Create sample meta tags
INSERT INTO meta_tags (page_path, title, description, keywords)
VALUES
('/', 'Kmetija Maroša - Ekološki izdelki iz Slovenije', 'Ekološki izdelki iz Slovenije - bučno olje, bučna semena, čaji in več.', 'ekološki izdelki, bučno olje, bučna semena, čaji, slovenija'),
('/izdelek/1', 'Bučno olje - Kmetija Maroša', 'Naše ekološko bučno olje je pridelano iz najboljših štajerskih buč.', 'bučno olje, ekološko, štajerske buče, slovenija');
