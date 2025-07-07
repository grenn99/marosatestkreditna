-- Fix infinite recursion in profiles RLS policy
-- This script fixes the issue with infinite recursion in the profiles table RLS policies

-- First, disable RLS on profiles table to stop the recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create fixed policies that don't cause recursion
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Create a special policy for admins that doesn't cause recursion
-- This policy uses a hardcoded list of admin emails instead of checking the profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE
    USING (
        auth.email() IN ('admin@example.com', 'nakupi@si.si')
    );

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;
