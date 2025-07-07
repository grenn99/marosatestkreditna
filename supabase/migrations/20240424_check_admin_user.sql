-- Check if the admin user exists in the profiles table
SELECT * FROM public.profiles WHERE email = 'nakupi@si.si';

-- If the admin user doesn't exist, insert it
INSERT INTO public.profiles (id, email, full_name, is_admin)
SELECT id, email, 'Admin User', TRUE
FROM auth.users
WHERE email = 'nakupi@si.si'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.users.id
);

-- If the admin user exists but is_admin is not TRUE, update it
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'nakupi@si.si'
AND (is_admin IS NULL OR is_admin = FALSE);

-- Check the admin user again
SELECT * FROM public.profiles WHERE email = 'nakupi@si.si';
