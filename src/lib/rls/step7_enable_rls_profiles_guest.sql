-- Step 7: Enable RLS on profiles_guest table
-- This script enables RLS on the profiles_guest table

-- First, check if RLS is already enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles_guest';

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

-- Verify RLS is enabled and policies are created
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles_guest';

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles_guest'
ORDER BY policyname;

-- Rollback instructions if needed:
-- ALTER TABLE public.profiles_guest DISABLE ROW LEVEL SECURITY;
