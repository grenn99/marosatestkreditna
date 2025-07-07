-- Step 3: Implement RLS for orders table

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own orders
DROP POLICY IF EXISTS "Users can read their own orders" ON public.orders;
CREATE POLICY "Users can read their own orders"
    ON public.orders
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.uid() = profile_id
    );

-- Policy to allow users to insert their own orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() = profile_id
    );

-- Policy to allow users to update their own orders
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders"
    ON public.orders
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.uid() = profile_id
    );

-- Policy to allow admins to read all orders
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
CREATE POLICY "Admins can read all orders"
    ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy to allow admins to insert any order
DROP POLICY IF EXISTS "Admins can insert any order" ON public.orders;
CREATE POLICY "Admins can insert any order"
    ON public.orders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy to allow admins to update any order
DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;
CREATE POLICY "Admins can update any order"
    ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy to allow service role to manage orders
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
CREATE POLICY "Service role can manage orders"
    ON public.orders
    USING (auth.role() = 'service_role');
