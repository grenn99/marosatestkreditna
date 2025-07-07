-- Step 4: Enable RLS on products table only
-- This script enables RLS only on the products table as a first step

-- First, check if RLS is already enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'products';

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

-- Verify RLS is enabled and policies are created
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'products';

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products'
ORDER BY policyname;

-- Rollback instructions if needed:
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
