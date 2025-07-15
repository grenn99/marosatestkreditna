-- Fix RLS policies for guest orders
-- This migration ensures that guest orders can be created without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow guest orders" ON public.orders;

-- Create a new policy that allows guest orders
CREATE POLICY "Allow guest orders" ON public.orders
    FOR INSERT
    WITH CHECK (
        -- Allow authenticated users to create orders for themselves
        (auth.uid() IS NOT NULL AND (profile_id = auth.uid() OR profile_id IS NULL)) OR
        -- Allow guest orders (no authentication required)
        (auth.uid() IS NULL AND is_guest_order = true) OR
        -- Allow authenticated users to create guest orders
        (auth.uid() IS NOT NULL AND is_guest_order = true)
    );

-- Also ensure users can read their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT
    USING (
        -- Users can view their own orders
        (auth.uid() IS NOT NULL AND profile_id = auth.uid()) OR
        -- Admins can view all orders
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        ))
    );

-- Ensure admins can manage all orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
