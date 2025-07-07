-- Export script for critical tables before applying RLS
-- Run this in the Supabase SQL Editor to get SQL statements that can recreate your data

-- Export products table structure and data
SELECT 
  'CREATE TABLE IF NOT EXISTS public.products_backup AS SELECT * FROM public.products;' AS products_backup;

-- Export orders table structure and data
SELECT 
  'CREATE TABLE IF NOT EXISTS public.orders_backup AS SELECT * FROM public.orders;' AS orders_backup;

-- Export profiles table structure and data
SELECT 
  'CREATE TABLE IF NOT EXISTS public.profiles_backup AS SELECT * FROM public.profiles;' AS profiles_backup;

-- Export profiles_guest table structure and data
SELECT 
  'CREATE TABLE IF NOT EXISTS public.profiles_guest_backup AS SELECT * FROM public.profiles_guest;' AS profiles_guest_backup;

-- Create a rollback script in case RLS causes issues
SELECT '-- Rollback script in case of issues with RLS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_guest DISABLE ROW LEVEL SECURITY;

-- Restore from backups if needed
-- DROP TABLE public.products;
-- ALTER TABLE public.products_backup RENAME TO products;

-- DROP TABLE public.orders;
-- ALTER TABLE public.orders_backup RENAME TO orders;

-- DROP TABLE public.profiles;
-- ALTER TABLE public.profiles_backup RENAME TO profiles;

-- DROP TABLE public.profiles_guest;
-- ALTER TABLE public.profiles_guest_backup RENAME TO profiles_guest;
' AS rollback_script;
