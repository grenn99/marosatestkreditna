-- Comprehensive Database Setup Script for Kmetija Marosa
-- This script creates the invoices table and applies RLS policies to all tables

-- =============================================
-- PART 1: CREATE INVOICES TABLE
-- =============================================

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_method TEXT NOT NULL,
    payment_id TEXT,
    invoice_number TEXT,
    invoice_url TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT,
    customer_city TEXT,
    customer_postal_code TEXT,
    customer_country TEXT,
    tax_rate DECIMAL(5, 2) DEFAULT 9.5,
    tax_amount DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_customer_email_idx ON public.invoices(customer_email);

-- =============================================
-- PART 2: PREPARE TABLES FOR RLS
-- =============================================

-- Add necessary columns to products table
DO $$
BEGIN
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id);

        -- Set default value for existing records (can be updated later)
        UPDATE public.products SET created_by = (
            SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1
        );
    END IF;

    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'isActive'
    ) THEN
        ALTER TABLE public.products ADD COLUMN "isActive" BOOLEAN DEFAULT true;

        -- Set all existing products to active
        UPDATE public.products SET "isActive" = true;
    END IF;
END
$$;

-- Add necessary columns to profiles table
DO $$
BEGIN
    -- Add is_admin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN "is_admin" BOOLEAN DEFAULT false;

        -- Set admin status for known admin emails
        UPDATE public.profiles
        SET "is_admin" = true
        WHERE id IN (
            SELECT id FROM auth.users WHERE email IN ('admin@example.com', 'nakupi@si.si')
        );
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN "is_active" BOOLEAN DEFAULT true;

        -- Set all existing profiles to active
        UPDATE public.profiles SET "is_active" = true;
    END IF;
END
$$;

-- Add necessary columns to profiles_guest table
DO $$
BEGIN
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles_guest' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.profiles_guest ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        -- Note: We can't set a default value for existing records since we don't know who created them
        -- They will be accessible only to admins
    END IF;
END
$$;

-- =============================================
-- PART 3: APPLY RLS POLICIES
-- =============================================

-- ----------------------
-- PRODUCTS TABLE
-- ----------------------

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Public can view active products
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT
    USING ("isActive" = true);

-- Authenticated users can view all products (including inactive ones) they created
CREATE POLICY "Users can view their own products" ON public.products
    FOR SELECT
    USING (created_by = auth.uid());

-- Only admins can insert products
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- Only admins can update products
CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- ----------------------
-- ORDERS TABLE
-- ----------------------

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT
    USING (
        -- Order belongs to the user directly
        (profile_id = auth.uid()) OR
        -- Order is linked to a profile that belongs to the user
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = orders.profile_id
            AND profiles.id = auth.uid()
        )
    );

-- Users can insert their own orders
CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT
    WITH CHECK (
        -- Order belongs to the user directly
        (profile_id = auth.uid()) OR
        -- Order is linked to a profile that belongs to the user
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = orders.profile_id
            AND profiles.id = auth.uid()
        ) OR
        -- Allow guest orders (no user authentication)
        (is_guest_order = true)
    );

-- Only admins can update orders
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- ----------------------
-- PROFILES TABLE
-- ----------------------

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- ----------------------
-- PROFILES_GUEST TABLE
-- ----------------------

-- Enable RLS on profiles_guest table
ALTER TABLE public.profiles_guest ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own guest profile" ON public.profiles_guest;
DROP POLICY IF EXISTS "Users can insert guest profiles" ON public.profiles_guest;
DROP POLICY IF EXISTS "Admins can view all guest profiles" ON public.profiles_guest;

-- Users can view their own guest profiles (if they created them)
CREATE POLICY "Users can view their own guest profile" ON public.profiles_guest
    FOR SELECT
    USING (
        -- Only if created_by is not null and matches the user's ID
        (created_by IS NOT NULL AND created_by = auth.uid())
    );

-- Anyone can insert guest profiles (for guest checkout)
CREATE POLICY "Users can insert guest profiles" ON public.profiles_guest
    FOR INSERT
    WITH CHECK (true);

-- Admins can view all guest profiles
CREATE POLICY "Admins can view all guest profiles" ON public.profiles_guest
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- ----------------------
-- INVOICES TABLE
-- ----------------------

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;

-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = invoices.order_id
            AND (
                orders.profile_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = orders.profile_id
                    AND profiles.id = auth.uid()
                )
            )
        )
    );

-- Only admins can insert/update invoices
CREATE POLICY "Admins can manage all invoices" ON public.invoices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles."is_admin" = true
        )
    );

-- =============================================
-- PART 4: ADD TRIGGERS FOR AUDIT TRAILS
-- =============================================

-- Create audit function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to invoices table
DROP TRIGGER IF EXISTS set_timestamp ON public.invoices;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- =============================================
-- PART 5: VERIFY SETUP
-- =============================================

-- Output tables with RLS enabled
SELECT table_name, has_row_level_security
FROM information_schema.tables
WHERE table_schema = 'public'
AND has_row_level_security = true;

-- Output policies for each table
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- ROLLBACK INSTRUCTIONS IF NEEDED
-- =============================================

-- If you need to rollback these changes, run:
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles_guest DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
