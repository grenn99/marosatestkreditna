-- FIX TRIGGER FOR NEW ORDERS
-- This will ensure NEW orders get automatic sequential numbers

-- 1. First, let's check if the trigger function exists and works
SELECT 'Function Check' as check_type,
       proname as function_name,
       prosrc as function_body
FROM pg_proc 
WHERE proname = 'get_next_order_number';

-- 2. Recreate the get_next_order_number function with better error handling
CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Update and get the next number in one atomic operation
    UPDATE public.order_counter 
    SET current_number = current_number + 1,
        updated_at = NOW()
    WHERE id = 1
    RETURNING current_number INTO next_number;
    
    -- If no row was updated, initialize the counter
    IF next_number IS NULL THEN
        INSERT INTO public.order_counter (id, current_number, updated_at)
        VALUES (1, 1101, NOW())
        ON CONFLICT (id) DO UPDATE SET 
            current_number = 1101,
            updated_at = NOW()
        RETURNING current_number INTO next_number;
    END IF;
    
    RETURN next_number;
END;
$$;

-- 3. Recreate the trigger function
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Always assign order number for new orders
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.get_next_order_number();
    END IF;
    RETURN NEW;
END;
$$;

-- 4. Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_assign_order_number ON public.orders;

CREATE TRIGGER trigger_assign_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_order_number();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_next_order_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.assign_order_number() TO anon, authenticated, service_role;

-- 6. Test the trigger with a real insert (will be rolled back)
BEGIN;
    -- Insert a test order
    INSERT INTO public.orders (
        user_id, profile_id, total_price, status, items, shipping_address, 
        payment_method, is_guest_order, created_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(), '10.00', 'pending', 
        '[]', '{}', 'bank_transfer', true, NOW()
    );
    
    -- Check if the trigger worked
    SELECT 'Trigger Test' as test_type,
           order_number,
           CASE 
               WHEN order_number IS NOT NULL THEN 'SUCCESS - New orders will get numbers!'
               ELSE 'FAILED - Trigger still not working'
           END as result
    FROM public.orders 
    ORDER BY created_at DESC 
    LIMIT 1;

ROLLBACK; -- Don't save the test order

-- 7. Show current counter status
SELECT 'Counter Status' as check_type,
       current_number as current_value,
       'Next new order will get: ' || (current_number + 1) as next_order
FROM public.order_counter 
WHERE id = 1;

-- 8. Update any recent orders that still have NULL order_number
UPDATE public.orders 
SET order_number = public.get_next_order_number()
WHERE order_number IS NULL;

-- 9. Final verification - show recent orders
SELECT 'Recent Orders After Fix' as check_type,
       order_number,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       created_at,
       total_price
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;
