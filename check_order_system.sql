-- Check if order numbering system is working
-- Copy and paste this into Supabase SQL Editor to debug

-- 1. Check if order_counter table exists and has data
SELECT 'Order Counter Table Status' as check_type, 
       id, current_number, updated_at 
FROM public.order_counter;

-- 2. Check if order_number column exists in orders table
SELECT 'Order Number Column Check' as check_type,
       column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'order_number';

-- 3. Check recent orders to see if order_number is being assigned
SELECT 'Recent Orders Check' as check_type,
       id, order_number, created_at, total_price
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check if the trigger exists
SELECT 'Trigger Check' as check_type,
       trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_assign_order_number';

-- 5. Test the function manually
SELECT 'Function Test' as check_type,
       public.get_next_order_number() as next_number;

-- 6. Check current counter after function test
SELECT 'Counter After Test' as check_type,
       current_number as current_value
FROM public.order_counter 
WHERE id = 1;
