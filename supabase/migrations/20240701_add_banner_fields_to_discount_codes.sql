-- Add banner-related fields to discount_codes table
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS banner_text TEXT;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS show_in_banner BOOLEAN DEFAULT FALSE;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS banner_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS banner_end_time TIMESTAMP WITH TIME ZONE;

-- Add comments to explain the fields
COMMENT ON COLUMN discount_codes.banner_text IS 'Text to display on the promotional banner';
COMMENT ON COLUMN discount_codes.show_in_banner IS 'Whether this discount should be shown in a banner';
COMMENT ON COLUMN discount_codes.banner_start_time IS 'When the banner should start displaying';
COMMENT ON COLUMN discount_codes.banner_end_time IS 'When the banner should stop displaying';

-- Update existing discount codes to have default values for the new fields
UPDATE discount_codes
SET
  banner_text = CASE
    WHEN discount_type = 'percentage' THEN CONCAT('Use code ', code, ' for ', discount_value, '% off!')
    WHEN discount_type = 'fixed' THEN CONCAT('Use code ', code, ' for €', discount_value, ' off!')
    ELSE CONCAT('Use code ', code, ' for discount')
  END,
  show_in_banner = FALSE,
  banner_start_time = valid_from,
  banner_end_time = valid_until
WHERE banner_text IS NULL;
