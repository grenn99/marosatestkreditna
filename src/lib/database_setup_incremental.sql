-- Incremental Database Setup Script for Kmetija Marosa
-- This script applies changes in stages so you can test after each step

-- =============================================
-- STEP 1: CREATE BACKUP TABLES
-- =============================================

-- Create backup of products table
CREATE TABLE IF NOT EXISTS public.products_backup AS SELECT * FROM public.products;

-- Create backup of orders table
CREATE TABLE IF NOT EXISTS public.orders_backup AS SELECT * FROM public.orders;

-- Create backup of profiles table
CREATE TABLE IF NOT EXISTS public.profiles_backup AS SELECT * FROM public.profiles;

-- Create backup of profiles_guest table
CREATE TABLE IF NOT EXISTS public.profiles_guest_backup AS SELECT * FROM public.profiles_guest;

-- =============================================
-- STEP 2: CREATE INVOICES TABLE
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
-- STEP 3: ADD NECESSARY COLUMNS
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

-- =============================================
-- STEP 4: ENABLE RLS ON PRODUCTS TABLE ONLY
-- =============================================

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

-- =============================================
-- STEP 5: VERIFY SETUP
-- =============================================

-- Output tables with RLS enabled
SELECT table_name, has_row_level_security 
FROM information_schema.tables
WHERE table_schema = 'public'
AND has_row_level_security = true;

-- Output policies for products table
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY policyname;

-- =============================================
-- ROLLBACK INSTRUCTIONS IF NEEDED
-- =============================================

-- If you need to rollback these changes, run:
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- 
-- If you need to restore from backup:
-- DROP TABLE public.products;
-- ALTER TABLE public.products_backup RENAME TO products;
