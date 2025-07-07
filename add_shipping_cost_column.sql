-- Add shipping_cost column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing orders to have a shipping_cost of 0
UPDATE public.orders SET shipping_cost = 0.00 WHERE shipping_cost IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.orders.shipping_cost IS 'The shipping cost for the order';
