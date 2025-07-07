-- Check the structure of the profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Check if the is_admin column exists
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_admin'
) AS is_admin_column_exists;

-- Check the values in the is_admin column
SELECT id, email, is_admin
FROM public.profiles
WHERE is_admin = true;
