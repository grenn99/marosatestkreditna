-- Fix DOBRODOSLI10 discount code dates
-- The issue was that valid_from was set to April 2025, but we're in January 2025
-- So the code wasn't valid yet (future start date)

UPDATE discount_codes
SET
  valid_from = '2025-01-01 00:00:00+00',  -- Start from January 1, 2025
  valid_until = '2025-12-31 23:59:59+00', -- Valid until end of 2025
  updated_at = NOW()
WHERE code = 'DOBRODOSLI10';

-- Verify the update
SELECT 
  code, 
  discount_type, 
  discount_value, 
  valid_from, 
  valid_until, 
  is_active,
  current_uses,
  max_uses
FROM discount_codes 
WHERE code = 'DOBRODOSLI10';
