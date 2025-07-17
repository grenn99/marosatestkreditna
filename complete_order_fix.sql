-- COMPLETE ORDER NUMBER FIX
-- This will handle all edge cases and fix the system properly

-- 1. First, let's see the current state
SELECT 'Current State Analysis' as step;

-- Check current orders and their order_number status
SELECT 'Order Analysis' as check_type,
       COUNT(*) as total_orders,
       COUNT(order_number) as with_numbers,
       COUNT(*) - COUNT(order_number) as without_numbers,
       MIN(order_number) as min_number,
       MAX(order_number) as max_number
FROM public.orders;

-- 2. Handle any duplicate order numbers by clearing them first
UPDATE public.orders 
SET order_number = NULL 
WHERE order_number IS NOT NULL;

-- 3. Reset the counter to start fresh
UPDATE public.order_counter 
SET current_number = 1100 
WHERE id = 1;

-- 4. Assign order numbers to ALL orders in chronological order
WITH numbered_orders AS (
    SELECT id, 
           ROW_NUMBER() OVER (ORDER BY created_at ASC) + 1100 as new_order_number
    FROM public.orders
)
UPDATE public.orders 
SET order_number = numbered_orders.new_order_number
FROM numbered_orders 
WHERE orders.id = numbered_orders.id;

-- 5. Update counter to reflect the highest assigned number
UPDATE public.order_counter 
SET current_number = (SELECT MAX(order_number) FROM public.orders),
    updated_at = NOW()
WHERE id = 1;

-- 6. Verify the results
SELECT 'Final Results' as step;

SELECT 'Orders with Numbers' as check_type,
       COUNT(*) as total_orders,
       MIN(order_number) as first_number,
       MAX(order_number) as last_number
FROM public.orders 
WHERE order_number IS NOT NULL;

-- 7. Show recent orders with their new numbers
SELECT 'Recent Orders' as check_type,
       order_number,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       created_at,
       total_price
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Check counter status
SELECT 'Counter Status' as check_type,
       current_number as current_value,
       'Next order will be: ' || (current_number + 1) as next_order
FROM public.order_counter 
WHERE id = 1;
