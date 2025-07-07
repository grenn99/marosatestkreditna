-- SQL script to add product_id column to analytics_events table if it doesn't exist

-- Check if product_id column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'analytics_events' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE analytics_events ADD COLUMN product_id TEXT;
        
        -- Create an index on the new column for better query performance
        CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON analytics_events(product_id);
        
        RAISE NOTICE 'Added product_id column to analytics_events table';
    ELSE
        RAISE NOTICE 'product_id column already exists in analytics_events table';
    END IF;
END
$$;
