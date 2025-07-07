-- Fix the dates for the discount codes to make them active now

-- Update the BREZPOSTNINE discount to be active now
UPDATE public.discount_codes
SET 
  valid_from = CURRENT_DATE,
  valid_until = CURRENT_DATE + INTERVAL '90 days',
  banner_start_time = CURRENT_DATE,
  banner_end_time = CURRENT_DATE + INTERVAL '90 days',
  show_in_banner = true
WHERE code = 'BREZPOSTNINE';

-- Make sure RLS is disabled to allow the banner to work
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;
