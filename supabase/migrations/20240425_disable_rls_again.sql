-- Disable RLS on all tables to restore functionality

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on products table
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.products TO authenticated;

-- Grant access to anon users for read-only operations
GRANT SELECT ON public.products TO anon;
