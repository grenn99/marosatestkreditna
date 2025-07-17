-- COMPLETE FIX: Order Numbering System
-- Copy and paste this into Supabase SQL Editor

-- 1. Drop and recreate the trigger function (fix any issues)
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only assign order number if it's not already set
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.get_next_order_number();
    END IF;
    RETURN NEW;
END;
$$;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_assign_order_number ON public.orders;

-- 3. Create the trigger properly
CREATE TRIGGER trigger_assign_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_order_number();

-- 4. Grant proper permissions
GRANT EXECUTE ON FUNCTION public.assign_order_number() TO anon, authenticated;

-- 5. Update existing orders that don't have order numbers
-- Get the current counter value first
DO $$
DECLARE
    current_counter INTEGER;
    order_record RECORD;
    new_order_number INTEGER;
BEGIN
    -- Get current counter
    SELECT current_number INTO current_counter FROM public.order_counter WHERE id = 1;
    
    -- Update existing orders without order numbers, starting from current counter + 1
    FOR order_record IN 
        SELECT id, created_at 
        FROM public.orders 
        WHERE order_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Increment counter
        current_counter := current_counter + 1;
        
        -- Update the order
        UPDATE public.orders 
        SET order_number = current_counter 
        WHERE id = order_record.id;
        
        -- Update the counter table
        UPDATE public.order_counter 
        SET current_number = current_counter, updated_at = NOW() 
        WHERE id = 1;
    END LOOP;
END $$;

-- 6. Test the trigger with a dummy insert (will be rolled back)
BEGIN;
    INSERT INTO public.orders (
        user_id, profile_id, total_price, status, items, shipping_address,
        payment_method, is_guest_order, created_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(), '10.00', 'pending',
        '[]', '{}', 'bank_transfer', true, NOW()
    );

    -- Check if order_number was assigned (get the most recent order)
    SELECT 'Trigger Test Result' as test_type,
           order_number,
           CASE
               WHEN order_number IS NOT NULL THEN 'SUCCESS - Trigger working!'
               ELSE 'FAILED - Trigger not working'
           END as status
    FROM public.orders
    ORDER BY created_at DESC
    LIMIT 1;

ROLLBACK; -- Don't actually save the test order

-- 7. Show final status
SELECT 'Final Status Check' as check_type,
       'Counter at: ' || current_number as status,
       'Next order will be: ' || (current_number + 1) as next_order
FROM public.order_counter 
WHERE id = 1;

-- 8. Show recent orders with their order numbers
SELECT 'Recent Orders with Numbers' as check_type,
       id, order_number, created_at, total_price
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;
