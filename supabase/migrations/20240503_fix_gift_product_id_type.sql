-- Fix the type mismatch in the gift_product_id column in the orders table

-- First, check if the column exists and its current type
DO $$
DECLARE
    column_exists BOOLEAN;
    column_type TEXT;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_id'
    ) INTO column_exists;

    IF column_exists THEN
        -- Get the current data type
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_id'
        INTO column_type;

        -- If the column is integer type, we need to change it to text
        IF column_type = 'integer' THEN
            -- First, drop the foreign key constraint if it exists
            EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_gift_product_id_fkey';
            
            -- Then, alter the column type to TEXT
            -- We need to cast the existing values to TEXT
            EXECUTE 'ALTER TABLE public.orders ALTER COLUMN gift_product_id TYPE TEXT USING gift_product_id::TEXT';
            
            -- Finally, add the foreign key constraint back
            EXECUTE 'ALTER TABLE public.orders ADD CONSTRAINT orders_gift_product_id_fkey FOREIGN KEY (gift_product_id) REFERENCES public.products(id)';
            
            RAISE NOTICE 'Changed gift_product_id column type from INTEGER to TEXT';
        ELSE
            RAISE NOTICE 'gift_product_id column is already of type %', column_type;
        END IF;
    ELSE
        -- If the column doesn't exist, create it with the correct type
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN gift_product_id TEXT REFERENCES public.products(id)';
        RAISE NOTICE 'Added gift_product_id column with TEXT type';
    END IF;
END
$$;

-- Make sure gift_product_package_id exists and is TEXT type
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_package_id'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- If the column doesn't exist, create it
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN gift_product_package_id TEXT';
        RAISE NOTICE 'Added gift_product_package_id column with TEXT type';
    END IF;
END
$$;

-- Make sure gift_product_cost exists and is DECIMAL type
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_cost'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- If the column doesn't exist, create it
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN gift_product_cost DECIMAL(10, 2)';
        RAISE NOTICE 'Added gift_product_cost column with DECIMAL type';
    END IF;
END
$$;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
AND column_name IN ('gift_product_id', 'gift_product_package_id', 'gift_product_cost');
-- Fix the type mismatch in the gift_product_id column in the orders table

-- First, check if the column exists and its current type
DO $$
DECLARE
    column_exists BOOLEAN;
    column_type TEXT;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_id'
    ) INTO column_exists;

    IF column_exists THEN
        -- Get the current data type
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_id'
        INTO column_type;

        -- If the column is integer type, we need to change it to text
        IF column_type = 'integer' THEN
            -- First, drop the foreign key constraint if it exists
            EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_gift_product_id_fkey';
            
            -- Then, alter the column type to TEXT
            -- We need to cast the existing values to TEXT
            EXECUTE 'ALTER TABLE public.orders ALTER COLUMN gift_product_id TYPE TEXT USING gift_product_id::TEXT';
            
            -- Finally, add the foreign key constraint back
            EXECUTE 'ALTER TABLE public.orders ADD CONSTRAINT orders_gift_product_id_fkey FOREIGN KEY (gift_product_id) REFERENCES public.products(id)';
            
            RAISE NOTICE 'Changed gift_product_id column type from INTEGER to TEXT';
        ELSE
            RAISE NOTICE 'gift_product_id column is already of type %', column_type;
        END IF;
    ELSE
        -- If the column doesn't exist, create it with the correct type
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN gift_product_id TEXT REFERENCES public.products(id)';
        RAISE NOTICE 'Added gift_product_id column with TEXT type';
    END IF;
END
$$;

-- Make sure gift_product_package_id exists and is TEXT type
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_package_id'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- If the column doesn't exist, create it
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN gift_product_package_id TEXT';
        RAISE NOTICE 'Added gift_product_package_id column with TEXT type';
    END IF;
END
$$;

-- Make sure gift_product_cost exists and is DECIMAL type
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'gift_product_cost'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- If the column doesn't exist, create it
        EXECUTE 'ALTER TABLE public.orders ADD COLUMN gift_product_cost DECIMAL(10, 2)';
        RAISE NOTICE 'Added gift_product_cost column with DECIMAL type';
    END IF;
END
$$;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
AND column_name IN ('gift_product_id', 'gift_product_package_id', 'gift_product_cost');
