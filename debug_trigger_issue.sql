-- DEBUG TRIGGER ISSUE - Find out why trigger is not firing
-- Copy to Supabase SQL Editor

-- 1. Check if trigger exists
SELECT 'Trigger Existence Check' as check_type,
       trigger_name,
       event_manipulation,
       action_timing,
       action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_assign_order_number';

-- 2. Check if functions exist
SELECT 'Function Existence Check' as check_type,
       proname as function_name,
       proowner,
       proacl as permissions
FROM pg_proc 
WHERE proname IN ('assign_order_number', 'get_next_order_number');

-- 3. Check order_counter table
SELECT 'Order Counter Check' as check_type,
       id,
       current_number,
       updated_at
FROM public.order_counter;

-- 4. Test the function manually
SELECT 'Manual Function Test' as check_type,
       public.get_next_order_number() as next_number;

-- 5. Check recent orders to see if any have order_number
SELECT 'Recent Orders Check' as check_type,
       SUBSTRING(id::text, 1, 8) as uuid_short,
       order_number,
       created_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Try a manual insert to test trigger (will be rolled back)
BEGIN;
    INSERT INTO public.orders (
        user_id, profile_id, total_price, status, items, shipping_address, 
        payment_method, is_guest_order, created_at
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(), '99.99', 'pending', 
        '[]', '{}', 'bank_transfer', true, NOW()
    );
    
    -- Check if trigger assigned order_number
    SELECT 'Trigger Test Result' as test_type,
           order_number,
           CASE 
               WHEN order_number IS NOT NULL THEN 'TRIGGER WORKING!'
               ELSE 'TRIGGER NOT WORKING'
           END as status
    FROM public.orders 
    WHERE total_price = '99.99'
    ORDER BY created_at DESC 
    LIMIT 1;
    
ROLLBACK; -- Don't save the test order
