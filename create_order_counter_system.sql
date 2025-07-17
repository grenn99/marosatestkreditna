-- Simple Sequential Order Number System
-- Copy and paste this into Supabase SQL Editor

-- 1. Create order counter table
CREATE TABLE IF NOT EXISTS public.order_counter (
    id INTEGER PRIMARY KEY DEFAULT 1,
    current_number INTEGER NOT NULL DEFAULT 1100,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert initial counter value (starting at 1100, so first order will be 1101)
INSERT INTO public.order_counter (id, current_number) 
VALUES (1, 1100) 
ON CONFLICT (id) DO NOTHING;

-- 3. Create function to get next order number atomically
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

-- 4. Add order_number column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number INTEGER UNIQUE;

-- 5. Create index on order_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, UPDATE ON public.order_counter TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_order_number() TO anon, authenticated;

-- 7. Test the function (this will create order number 1101)
SELECT public.get_next_order_number() as first_order_number;

-- 8. Verify the setup
SELECT 
    'Order counter system ready' as status,
    current_number as last_assigned,
    (current_number + 1) as next_will_be
FROM public.order_counter 
WHERE id = 1;
