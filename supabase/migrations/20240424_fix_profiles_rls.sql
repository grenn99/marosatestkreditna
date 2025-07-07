-- Add missing RLS policies for INSERT operations on profiles table

-- Policy to allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy to allow admins to insert any profile
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
CREATE POLICY "Admins can insert any profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

-- Policy to allow service role to manage profiles (for triggers and functions)
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles"
    ON public.profiles
    USING (auth.role() = 'service_role');
