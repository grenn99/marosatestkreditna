-- Test discount codes for development
-- Run this in Supabase SQL Editor to create test discount codes

-- First, make sure RLS is disabled for testing
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;

-- Clear existing test codes (optional)
DELETE FROM public.discount_codes WHERE code IN ('BREZPOSTNINE', 'DOBRODOSLI10', 'POLETJE2025', 'TEST10', 'WELCOME20');

-- Insert test discount codes
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
-- BREZPOSTNINE - Free shipping discount
('BREZPOSTNINE', 'fixed', 3.90, 20.00, NULL, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true, true, 'Uporabite kodo BREZPOSTNINE za €3.90 popusta pri nakupu nad €20.00!', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days'),

-- DOBRODOSLI10 - Welcome discount
('DOBRODOSLI10', 'percentage', 10, NULL, 100, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, true, 'Dobrodošli! Uporabite kodo DOBRODOSLI10 za 10% popusta na prvo naročilo!', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),

-- POLETJE2025 - Summer sale
('POLETJE2025', 'percentage', 15, 30.00, NULL, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true, false, 'Poletna akcija - 15% popusta pri nakupu nad €30!', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),

-- TEST10 - Simple test discount
('TEST10', 'percentage', 10, NULL, NULL, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', true, false, NULL, NULL, NULL),

-- WELCOME20 - Fixed amount welcome discount
('WELCOME20', 'fixed', 5.00, 25.00, 50, 0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, false, NULL, NULL, NULL);

-- Verify the inserted codes
SELECT code, discount_type, discount_value, min_order_amount, max_uses, current_uses, is_active, valid_from, valid_until 
FROM public.discount_codes 
WHERE code IN ('BREZPOSTNINE', 'DOBRODOSLI10', 'POLETJE2025', 'TEST10', 'WELCOME20')
ORDER BY code;
