-- Create gift-related tables for the Darilo feature

-- Gift packages table (for different gift packaging options)
CREATE TABLE IF NOT EXISTS gift_packages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_de TEXT,
    name_hr TEXT,
    description TEXT,
    description_en TEXT,
    description_de TEXT,
    description_hr TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift recipients table (for storing recipient information)
CREATE TABLE IF NOT EXISTS gift_recipients (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Slovenija',
    message TEXT,
    gift_package_id INTEGER REFERENCES gift_packages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift items table (for products included in a gift)
CREATE TABLE IF NOT EXISTS gift_items (
    id SERIAL PRIMARY KEY,
    gift_recipient_id INTEGER REFERENCES gift_recipients(id),
    product_id TEXT REFERENCES products(id),
    package_option_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some initial gift package options
INSERT INTO gift_packages (name, name_en, name_de, name_hr, description, description_en, description_de, description_hr, base_price, image_url, is_active)
VALUES
    ('Osnovno darilo', 'Basic Gift', 'Basis-Geschenk', 'Osnovni poklon', 'Osnovna darilna embalaža z enim izdelkom po vaši izbiri.', 'Basic gift packaging with one product of your choice.', 'Basis-Geschenkverpackung mit einem Produkt Ihrer Wahl.', 'Osnovno poklon pakiranje s jednim proizvodom po vašem izboru.', 5.00, '/images/gifts/basic.jpg', TRUE),
    ('Premium darilo', 'Premium Gift', 'Premium-Geschenk', 'Premium poklon', 'Elegantna darilna embalaža z do tremi izdelki po vaši izbiri.', 'Elegant gift packaging with up to three products of your choice.', 'Elegante Geschenkverpackung mit bis zu drei Produkten Ihrer Wahl.', 'Elegantno poklon pakiranje s do tri proizvoda po vašem izboru.', 12.00, '/images/gifts/premium.jpg', TRUE),
    ('Luksuzno darilo', 'Luxury Gift', 'Luxus-Geschenk', 'Luksuzni poklon', 'Luksuzna darilna škatla z do petimi izdelki po vaši izbiri in personalizirano kartico.', 'Luxury gift box with up to five products of your choice and a personalized card.', 'Luxuriöse Geschenkbox mit bis zu fünf Produkten Ihrer Wahl und einer personalisierten Karte.', 'Luksuzna poklon kutija s do pet proizvoda po vašem izboru i personaliziranom karticom.', 25.00, '/images/gifts/luxury.jpg', TRUE);

-- Add RLS policies for the new tables
ALTER TABLE gift_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_items ENABLE ROW LEVEL SECURITY;

-- Policies for gift_packages
CREATE POLICY "Gift packages are viewable by everyone" ON gift_packages
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage gift packages" ON gift_packages
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Policies for gift_recipients
CREATE POLICY "Users can view their own gift recipients" ON gift_recipients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = gift_recipients.order_id
            AND (orders.profile_id = auth.uid() OR orders.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert gift recipients" ON gift_recipients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = gift_recipients.order_id
            AND (orders.profile_id = auth.uid() OR orders.user_id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage gift recipients" ON gift_recipients
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Policies for gift_items
CREATE POLICY "Users can view their own gift items" ON gift_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gift_recipients
            JOIN public.orders ON gift_recipients.order_id = orders.id
            WHERE gift_recipients.id = gift_items.gift_recipient_id
            AND (orders.profile_id = auth.uid() OR orders.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert gift items" ON gift_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.gift_recipients
            JOIN public.orders ON gift_recipients.order_id = orders.id
            WHERE gift_recipients.id = gift_items.gift_recipient_id
            AND (orders.profile_id = auth.uid() OR orders.user_id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage gift items" ON gift_items
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );
