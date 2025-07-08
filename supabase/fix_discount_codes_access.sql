-- Fix discount codes access issues
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS to allow access during development
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Discount codes are viewable by everyone" ON public.discount_codes;
DROP POLICY IF EXISTS "Discount codes are editable by admins only" ON public.discount_codes;

-- Create new policy to allow public read access for active discount codes
CREATE POLICY "Allow public read access to active discount codes" ON public.discount_codes
  FOR SELECT USING (is_active = true);

-- Create policy to allow admin write access
CREATE POLICY "Allow admin write access to discount codes" ON public.discount_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Re-enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Insert test discount codes if they don't exist
INSERT INTO public.discount_codes (
  code, 
  discount_type, 
  discount_value, 
  min_order_amount, 
  max_uses, 
  current_uses, 
  valid_from, 
  valid_until, 
  is_active,
  show_in_banner,
  banner_text,
  banner_start_time,
  banner_end_time
) VALUES 
('BREZPOSTNINE', 'fixed', 3.90, 20.00, NULL, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true, true, 'Uporabite kodo BREZPOSTNINE za €3.90 popusta pri nakupu nad €20.00!', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days'),
('DOBRODOSLI10', 'percentage', 10, NULL, 100, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, true, 'Dobrodošli! Uporabite kodo DOBRODOSLI10 za 10% popusta na prvo naročilo!', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('TEST10', 'percentage', 10, NULL, NULL, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', true, false, NULL, NULL, NULL)
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order_amount = EXCLUDED.min_order_amount,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  is_active = EXCLUDED.is_active;

-- Verify the codes exist
SELECT code, discount_type, discount_value, min_order_amount, is_active, valid_from, valid_until 
FROM public.discount_codes 
WHERE code IN ('BREZPOSTNINE', 'DOBRODOSLI10', 'TEST10')
ORDER BY code;
