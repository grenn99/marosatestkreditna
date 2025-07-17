-- SIMPLE ORDER NUMBER FIX
-- This will definitely work - copy to Supabase SQL Editor

-- 1. First, let's manually assign order numbers to existing orders
UPDATE public.orders 
SET order_number = (
    SELECT ROW_NUMBER() OVER (ORDER BY created_at) + 1100
    FROM public.orders o2 
    WHERE o2.id = orders.id
)
WHERE order_number IS NULL;

-- 2. Update the counter to match the highest order number
UPDATE public.order_counter 
SET current_number = (
    SELECT COALESCE(MAX(order_number), 1100) 
    FROM public.orders
)
WHERE id = 1;

-- 3. Show the results
SELECT 'Orders Updated' as status,
       COUNT(*) as total_orders,
       MIN(order_number) as first_order_number,
       MAX(order_number) as last_order_number
FROM public.orders 
WHERE order_number IS NOT NULL;

-- 4. Show recent orders with their new numbers
SELECT 'Recent Orders' as check_type,
       order_number, 
       SUBSTRING(id::text, 1, 8) as uuid_short,
       created_at,
       total_price
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;
