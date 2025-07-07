-- Add gift product columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_product_id TEXT REFERENCES products(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_product_package_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_product_cost DECIMAL(10, 2);
