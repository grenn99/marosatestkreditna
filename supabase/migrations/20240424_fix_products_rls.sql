-- Add RLS policies for products table

-- First, enable RLS on the products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read products (public access)
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products"
    ON public.products
    FOR SELECT
    USING (true);

-- Policy to allow admins to insert products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

-- Policy to allow admins to update products
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

-- Policy to allow admins to delete products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

-- Policy to allow service role to manage products
DROP POLICY IF EXISTS "Service role can manage products" ON public.products;
CREATE POLICY "Service role can manage products"
    ON public.products
    USING (auth.role() = 'service_role');
