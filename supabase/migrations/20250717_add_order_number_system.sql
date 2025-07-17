-- Add simple sequential order numbering system
-- This migration adds a counter table and function for generating simple order numbers like 1101, 1102, etc.

-- Create order counter table
CREATE TABLE IF NOT EXISTS public.order_counter (
    id INTEGER PRIMARY KEY DEFAULT 1,
    current_number INTEGER NOT NULL DEFAULT 1100,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial counter value (starting at 1100, so first order will be 1101)
INSERT INTO public.order_counter (id, current_number) 
VALUES (1, 1100) 
ON CONFLICT (id) DO NOTHING;

-- Create function to get next order number atomically
CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Atomically increment and return the next order number
    UPDATE public.order_counter 
    SET current_number = current_number + 1,
        updated_at = NOW()
    WHERE id = 1
    RETURNING current_number INTO next_number;
    
    -- If no row was updated (shouldn't happen), initialize it
    IF next_number IS NULL THEN
        INSERT INTO public.order_counter (id, current_number) 
        VALUES (1, 1101) 
        ON CONFLICT (id) DO UPDATE SET current_number = 1101;
        next_number := 1101;
    END IF;
    
    RETURN next_number;
END;
$$;

-- Add order_number column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number INTEGER UNIQUE;

-- Create index on order_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Create trigger to automatically assign order numbers
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only assign order number if it's not already set
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.get_next_order_number();
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger that fires before insert
DROP TRIGGER IF EXISTS trigger_assign_order_number ON public.orders;
CREATE TRIGGER trigger_assign_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_order_number();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, UPDATE ON public.order_counter TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_order_number() TO anon, authenticated;

-- Test the function (this will create order number 1101)
-- SELECT public.get_next_order_number() as test_order_number;

-- Verify the setup
SELECT 
    'Order counter table created' as status,
    current_number as next_will_be
FROM public.order_counter 
WHERE id = 1;
