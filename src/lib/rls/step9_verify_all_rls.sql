-- Step 9: Verify all RLS policies
-- This script checks that all tables have RLS enabled and appropriate policies

-- Check which tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check all policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Rollback instructions if needed:
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles_guest DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
