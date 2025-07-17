-- FIX DUPLICATE ORDER NUMBERS
-- This will resolve the conflict and ensure clean sequential numbering

-- 1. First, clear ALL order numbers to start completely fresh
UPDATE public.orders 
SET order_number = NULL;

-- 2. Reset the counter to start from 1100
UPDATE public.order_counter 
SET current_number = 1100,
    updated_at = NOW()
WHERE id = 1;

-- 3. Assign clean sequential numbers to ALL existing orders
WITH ordered_orders AS (
    SELECT id, 
           ROW_NUMBER() OVER (ORDER BY created_at ASC) + 1100 as clean_number
    FROM public.orders
)
UPDATE public.orders 
SET order_number = ordered_orders.clean_number
FROM ordered_orders 
WHERE orders.id = ordered_orders.id;

-- 4. Update counter to the highest assigned number
UPDATE public.order_counter 
SET current_number = (SELECT MAX(order_number) FROM public.orders),
    updated_at = NOW()
WHERE id = 1;

-- 5. Test the trigger again (should work now without conflicts)
BEGIN;
    INSERT INTO public.orders (
        user_id, profile_id, total_price, status, items, shipping_address, 
        payment_method, is_guest_order, created_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(), '77.77', 'pending', 
        '[]', '{}', 'bank_transfer', true, NOW()
    );
    
    -- Check if trigger worked without conflicts
    SELECT 'TRIGGER TEST AFTER FIX' as test_type,
           order_number,
           CASE 
               WHEN order_number IS NOT NULL THEN '✅ SUCCESS - No more conflicts!'
               ELSE '❌ FAILED - Still issues'
           END as status
    FROM public.orders 
    WHERE total_price = '77.77'
    ORDER BY created_at DESC 
    LIMIT 1;
    
ROLLBACK; -- Don't save test order

-- 6. Show final status
SELECT 'Final Status' as check_type,
       COUNT(*) as total_orders,
       COUNT(order_number) as orders_with_numbers,
       MIN(order_number) as first_number,
       MAX(order_number) as last_number,
       CASE 
           WHEN COUNT(*) = COUNT(order_number) THEN '✅ ALL ORDERS HAVE CLEAN NUMBERS'
           ELSE '❌ SOME ORDERS MISSING NUMBERS'
       END as status
FROM public.orders;

-- 7. Show counter status
SELECT 'Counter Ready' as info,
       current_number as current_value,
       'Next new order will get: ' || (current_number + 1) as next_order
FROM public.order_counter 
WHERE id = 1;

-- 8. Show recent orders with their clean numbers
SELECT 'Recent Orders with Clean Numbers' as check_type,
       order_number,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       created_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;
