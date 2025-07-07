-- Fix remaining RLS policies
-- This script fixes the remaining RLS policies that might be causing issues

-- ----------------------
-- PRODUCTS TABLE
-- ----------------------

-- First, disable RLS on products table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Re-enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create fixed policies
-- Public can view active products
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT
    USING ("isActive" = true);

-- Authenticated users can view all products (including inactive ones) they created
CREATE POLICY "Users can view their own products" ON public.products
    FOR SELECT
    USING (created_by = auth.uid());

-- Only admins can insert products - using auth.email() instead of checking profiles
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT
    WITH CHECK (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- Only admins can update products - using auth.email() instead of checking profiles
CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- Only admins can delete products - using auth.email() instead of checking profiles
CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- ----------------------
-- ORDERS TABLE
-- ----------------------

-- Disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create fixed policies
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

-- Only admins can update orders - using auth.email() instead of checking profiles
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- Admins can view all orders - using auth.email() instead of checking profiles
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- ----------------------
-- PROFILES_GUEST TABLE
-- ----------------------

-- Disable RLS on profiles_guest table
ALTER TABLE public.profiles_guest DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own guest profile" ON public.profiles_guest;
DROP POLICY IF EXISTS "Users can insert guest profiles" ON public.profiles_guest;
DROP POLICY IF EXISTS "Admins can view all guest profiles" ON public.profiles_guest;

-- Re-enable RLS
ALTER TABLE public.profiles_guest ENABLE ROW LEVEL SECURITY;

-- Create fixed policies
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

-- Admins can view all guest profiles - using auth.email() instead of checking profiles
CREATE POLICY "Admins can view all guest profiles" ON public.profiles_guest
    FOR SELECT
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- ----------------------
-- INVOICES TABLE
-- ----------------------

-- Disable RLS on invoices table
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;

-- Re-enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create fixed policies
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

-- Only admins can insert/update invoices - using auth.email() instead of checking profiles
CREATE POLICY "Admins can manage all invoices" ON public.invoices
    FOR ALL
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- Verify all policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
