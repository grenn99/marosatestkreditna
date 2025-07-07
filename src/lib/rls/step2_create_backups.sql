-- Step 2: Create backup tables
-- This script creates backup tables for all existing tables

-- Create backup of products table
CREATE TABLE IF NOT EXISTS public.products_backup AS 
SELECT * FROM public.products;

-- Create backup of orders table
CREATE TABLE IF NOT EXISTS public.orders_backup AS 
SELECT * FROM public.orders;

-- Create backup of profiles table
CREATE TABLE IF NOT EXISTS public.profiles_backup AS 
SELECT * FROM public.profiles;

-- Create backup of profiles_guest table
CREATE TABLE IF NOT EXISTS public.profiles_guest_backup AS 
SELECT * FROM public.profiles_guest;

-- Verify backups were created
SELECT 
    'products' AS table_name, 
    COUNT(*) AS original_count,
    (SELECT COUNT(*) FROM products_backup) AS backup_count
FROM products
UNION ALL
SELECT 
    'orders' AS table_name, 
    COUNT(*) AS original_count,
    (SELECT COUNT(*) FROM orders_backup) AS backup_count
FROM orders
UNION ALL
SELECT 
    'profiles' AS table_name, 
    COUNT(*) AS original_count,
    (SELECT COUNT(*) FROM profiles_backup) AS backup_count
FROM profiles
UNION ALL
SELECT 
    'profiles_guest' AS table_name, 
    COUNT(*) AS original_count,
    (SELECT COUNT(*) FROM profiles_guest_backup) AS backup_count
FROM profiles_guest;
