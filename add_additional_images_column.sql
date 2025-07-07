-- Add additional_images column to products table
ALTER TABLE products 
ADD COLUMN additional_images TEXT[] DEFAULT '{}';

-- Comment on the column
COMMENT ON COLUMN products.additional_images IS 'Array of additional image URLs for the product (up to 5)';
