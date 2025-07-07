-- Disable RLS on profiles table to restore functionality
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON public.profiles TO authenticated;
