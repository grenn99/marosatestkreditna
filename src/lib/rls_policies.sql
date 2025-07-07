-- Row Level Security Policies for Kmetija Marosa Application

-- =====================
-- PRODUCTS TABLE
-- =====================

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT
    USING (isActive = true);

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
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Only admins can update products
CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- =====================
-- ORDERS TABLE
-- =====================

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

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
            AND profiles.user_id = auth.uid()
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
            AND profiles.user_id = auth.uid()
        ) OR
        -- Allow guest orders (no user authentication)
        (is_guest_order = true)
    );

-- Users cannot update or delete orders
-- Only admins can update orders
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- No one can delete orders (for audit purposes)
-- If needed, add a "cancelled" status instead

-- =====================
-- PROFILES TABLE
-- =====================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- No one can delete profiles (deactivate instead)
-- If needed, add an "is_active" column to profiles

-- =====================
-- CART ITEMS TABLE (if exists)
-- =====================

-- Enable RLS on cart_items table (if it exists)
-- ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- -- Users can only access their own cart items
-- CREATE POLICY "Users can manage their own cart items" ON public.cart_items
--     USING (user_id = auth.uid());

-- =====================
-- ADDITIONAL NOTES
-- =====================

-- 1. Make sure to add a created_by column to the products table if it doesn't exist:
-- ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- 2. Make sure to add an is_admin column to the profiles table if it doesn't exist:
-- ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- 3. Consider adding an is_active column to the profiles table for soft deletion:
-- ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
