-- Check the structure of the orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders';

-- Check if the user_id and profile_id columns exist
SELECT 
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'user_id'
    ) AS user_id_column_exists,
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'profile_id'
    ) AS profile_id_column_exists;
