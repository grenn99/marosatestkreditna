-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_admin column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Update existing admin users
UPDATE public.profiles
SET is_admin = TRUE
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'nakupi@si.si'
);

-- Create or replace function to sync user metadata with profiles
CREATE OR REPLACE FUNCTION public.sync_user_admin_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_metadata contains is_admin, update profiles table
    IF NEW.raw_user_meta_data ? 'is_admin' THEN
        UPDATE public.profiles
        SET is_admin = (NEW.raw_user_meta_data->>'is_admin')::boolean
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync user metadata with profiles
DROP TRIGGER IF EXISTS sync_user_admin_status_trigger ON auth.users;
CREATE TRIGGER sync_user_admin_status_trigger
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_admin_status();

-- Add RLS policy for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy to allow admins to read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );

-- Policy to allow admins to update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
    );
