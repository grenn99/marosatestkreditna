-- Step 5: Enable RLS on orders table
-- This script enables RLS on the orders table

-- First, check if RLS is already enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'orders';

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

-- Verify RLS is enabled and policies are created
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'orders';

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders'
ORDER BY policyname;

-- Rollback instructions if needed:
-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
