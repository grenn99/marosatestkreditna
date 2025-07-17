-- DIAGNOSE ORDER NUMBER SYSTEM
-- Copy to Supabase SQL Editor to see what's really happening

-- 1. Check which orders have order numbers and which don't
SELECT 'Order Number Status' as check_type,
       COUNT(*) as total_orders,
       COUNT(order_number) as orders_with_numbers,
       COUNT(*) - COUNT(order_number) as orders_without_numbers
FROM public.orders;

-- 2. Show orders with and without order numbers
SELECT 'Orders with Numbers' as type,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       order_number,
       created_at,
       total_price
FROM public.orders 
WHERE order_number IS NOT NULL
ORDER BY order_number DESC
LIMIT 5;

SELECT 'Orders without Numbers' as type,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       order_number,
       created_at,
       total_price
FROM public.orders 
WHERE order_number IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check for duplicate order numbers
SELECT 'Duplicate Check' as check_type,
       order_number,
       COUNT(*) as count
FROM public.orders 
WHERE order_number IS NOT NULL
GROUP BY order_number
HAVING COUNT(*) > 1;

-- 4. Check current counter status
SELECT 'Counter Status' as check_type,
       current_number,
       updated_at
FROM public.order_counter
WHERE id = 1;
