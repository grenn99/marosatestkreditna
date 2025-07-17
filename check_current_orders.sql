-- Check current order number status
-- Copy to Supabase SQL Editor

-- 1. Show all recent orders with their order_number status
SELECT 'Recent Orders Status' as check_type,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       order_number,
       created_at,
       total_price,
       CASE 
           WHEN order_number IS NOT NULL THEN 'HAS NUMBER'
           ELSE 'NO NUMBER'
       END as status
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check the range of order numbers
SELECT 'Order Number Range' as check_type,
       COUNT(*) as total_orders,
       COUNT(order_number) as orders_with_numbers,
       MIN(order_number) as min_number,
       MAX(order_number) as max_number
FROM public.orders;

-- 3. Check counter status
SELECT 'Counter Status' as check_type,
       current_number,
       updated_at
FROM public.order_counter 
WHERE id = 1;
