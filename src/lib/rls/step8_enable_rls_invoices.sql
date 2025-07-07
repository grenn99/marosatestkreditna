-- Step 8: Enable RLS on invoices table
-- This script enables RLS on the invoices table

-- First, check if RLS is already enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'invoices';

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

-- Verify RLS is enabled and policies are created
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'invoices';

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'invoices'
ORDER BY policyname;

-- Rollback instructions if needed:
-- ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
