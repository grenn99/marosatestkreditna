-- FIX ALL ORDER NUMBERS TO BE SIMPLE SEQUENTIAL
-- This will ensure ALL orders have simple numbers like 1101, 1102, etc.

-- 1. Clear ALL existing order numbers to start fresh
UPDATE public.orders 
SET order_number = NULL;

-- 2. Reset counter to 1100
UPDATE public.order_counter 
SET current_number = 1100,
    updated_at = NOW()
WHERE id = 1;

-- 3. Assign simple sequential numbers to ALL orders (1101, 1102, 1103, etc.)
WITH ordered_orders AS (
    SELECT id, 
           ROW_NUMBER() OVER (ORDER BY created_at ASC) + 1100 as simple_number
    FROM public.orders
)
UPDATE public.orders 
SET order_number = ordered_orders.simple_number
FROM ordered_orders 
WHERE orders.id = ordered_orders.id;

-- 4. Update counter to the highest assigned number
UPDATE public.order_counter 
SET current_number = (SELECT MAX(order_number) FROM public.orders),
    updated_at = NOW()
WHERE id = 1;

-- 5. Verify ALL orders now have simple numbers
SELECT 'Verification' as check_type,
       COUNT(*) as total_orders,
       COUNT(order_number) as orders_with_numbers,
       MIN(order_number) as first_number,
       MAX(order_number) as last_number,
       CASE 
           WHEN COUNT(*) = COUNT(order_number) THEN 'SUCCESS - All orders have numbers!'
           ELSE 'ERROR - Some orders missing numbers'
       END as status
FROM public.orders;

-- 6. Show the recent orders with their new simple numbers
SELECT 'Recent Orders with Simple Numbers' as check_type,
       order_number,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       created_at,
       total_price
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Show counter status
SELECT 'Counter Ready for Next Order' as check_type,
       current_number as current_value,
       (current_number + 1) as next_order_will_be
FROM public.order_counter 
WHERE id = 1;
