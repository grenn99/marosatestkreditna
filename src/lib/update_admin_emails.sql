-- Remove admin privileges from the example account
UPDATE public.profiles 
SET "is_admin" = false 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- Ensure your actual admin account has admin privileges
UPDATE public.profiles 
SET "is_admin" = true 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'nakupi@si.si'
);

-- Output the current admin users for verification
SELECT 
    u.email,
    p.is_admin
FROM 
    auth.users u
JOIN 
    public.profiles p ON u.id = p.id
WHERE 
    p.is_admin = true;
