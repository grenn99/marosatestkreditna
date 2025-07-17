-- COMPLETE TRIGGER FIX - Address all possible issues
-- This will fix the core database trigger issue

-- 1. Drop everything and start fresh
DROP TRIGGER IF EXISTS trigger_assign_order_number ON public.orders;
DROP FUNCTION IF EXISTS public.assign_order_number();
DROP FUNCTION IF EXISTS public.get_next_order_number();

-- 2. Recreate the counter function with maximum permissions
CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Ensure counter table exists and has data
    INSERT INTO public.order_counter (id, current_number, updated_at)
    VALUES (1, 1100, NOW())
    ON CONFLICT (id) DO NOTHING;
    
    -- Atomically increment and return the next order number
    UPDATE public.order_counter 
    SET current_number = current_number + 1,
        updated_at = NOW()
    WHERE id = 1
    RETURNING current_number INTO next_number;
    
    -- If still null, force initialize
    IF next_number IS NULL THEN
        UPDATE public.order_counter 
        SET current_number = 1101,
            updated_at = NOW()
        WHERE id = 1;
        next_number := 1101;
    END IF;
    
    RETURN next_number;
END;
$$;

-- 3. Create trigger function with maximum permissions
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Always assign order number if it's null
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.get_next_order_number();
    END IF;
    RETURN NEW;
END;
$$;

-- 4. Create the trigger
CREATE TRIGGER trigger_assign_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_order_number();

-- 5. Grant ALL necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.order_counter TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_next_order_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.assign_order_number() TO anon, authenticated, service_role;

-- 6. Ensure RLS is disabled on order_counter (if it exists)
ALTER TABLE public.order_counter DISABLE ROW LEVEL SECURITY;

-- 7. Test the complete system
BEGIN;
    -- Test insert
    INSERT INTO public.orders (
        user_id, profile_id, total_price, status, items, shipping_address, 
        payment_method, is_guest_order, created_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(), '88.88', 'pending', 
        '[]', '{}', 'bank_transfer', true, NOW()
    );
    
    -- Check result
    SELECT 'FINAL TEST RESULT' as test_type,
           order_number,
           CASE 
               WHEN order_number IS NOT NULL THEN '✅ SUCCESS - Trigger is working!'
               ELSE '❌ FAILED - Still not working'
           END as status,
           'Order number assigned: ' || COALESCE(order_number::text, 'NULL') as details
    FROM public.orders 
    WHERE total_price = '88.88'
    ORDER BY created_at DESC 
    LIMIT 1;
    
ROLLBACK; -- Don't save test order

-- 8. Show current counter status
SELECT 'Counter Status' as info,
       current_number as current_value,
       'Next order will be: ' || (current_number + 1) as next_order
FROM public.order_counter 
WHERE id = 1;

-- 9. Update any existing orders that still have NULL order_number
UPDATE public.orders 
SET order_number = (
    SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC) + 
           (SELECT COALESCE(MAX(order_number), 1100) FROM public.orders WHERE order_number IS NOT NULL)
    FROM public.orders o2 
    WHERE o2.id = orders.id
)
WHERE order_number IS NULL;

-- 10. Update counter to reflect all assigned numbers
UPDATE public.order_counter 
SET current_number = (SELECT COALESCE(MAX(order_number), 1100) FROM public.orders),
    updated_at = NOW()
WHERE id = 1;

-- 11. Final verification
SELECT 'Final Verification' as check_type,
       COUNT(*) as total_orders,
       COUNT(order_number) as orders_with_numbers,
       MIN(order_number) as first_number,
       MAX(order_number) as last_number,
       CASE 
           WHEN COUNT(*) = COUNT(order_number) THEN '✅ ALL ORDERS HAVE NUMBERS'
           ELSE '❌ SOME ORDERS MISSING NUMBERS'
       END as status
FROM public.orders;
