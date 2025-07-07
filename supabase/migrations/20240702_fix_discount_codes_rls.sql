-- Fix RLS policies for discount_codes table

-- TEMPORARILY DISABLE RLS for testing
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Discount codes are viewable by everyone" ON public.discount_codes;
DROP POLICY IF EXISTS "Discount codes are editable by admins only" ON public.discount_codes;
DROP POLICY IF EXISTS "Discount codes are editable by admins via meta" ON public.discount_codes;
DROP POLICY IF EXISTS "Discount codes are editable by specific admins" ON public.discount_codes;

-- Create policy to allow anyone to view discount codes
CREATE POLICY "Discount codes are viewable by everyone" ON public.discount_codes
  FOR SELECT USING (true);

-- Create policy to allow only admins to edit discount codes
CREATE POLICY "Discount codes are editable by admins only" ON public.discount_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- IMPORTANT: Keep RLS disabled for now until we fix the permission issues
-- To re-enable RLS later, run:
-- ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
