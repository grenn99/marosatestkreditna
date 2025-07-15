-- Disable RLS on tables required for guest checkout
-- Run this in your Supabase SQL Editor

-- CRITICAL: Disable RLS on profiles table (guest checkout creates profiles)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on orders table (required for guest checkout)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on products table (required for product display)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Disable RLS on translations table (required for multilingual support)
ALTER TABLE public.translations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on analytics_daily_metrics table (causing 406 errors)
ALTER TABLE public.analytics_daily_metrics DISABLE ROW LEVEL SECURITY;

-- Optional: Disable RLS on other tables that might be needed
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'orders', 'products', 'translations', 'analytics_daily_metrics', 'discount_codes', 'gift_options', 'newsletter_subscribers')
ORDER BY tablename;
