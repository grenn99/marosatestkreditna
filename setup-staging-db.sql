-- Staging Database Setup Script

-- Create a function to check if we're in the staging environment
CREATE OR REPLACE FUNCTION is_staging_environment()
RETURNS BOOLEAN AS 73419
BEGIN
  -- This should return true only in the staging environment
  -- You can customize this based on your environment detection method
  RETURN current_database() LIKE '%staging%';
END;
73419 LANGUAGE plpgsql;

-- Add a staging indicator to all tables
DO 73419
DECLARE
  table_name text;
BEGIN
  IF is_staging_environment() THEN
    FOR table_name IN 
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    LOOP
      -- Check if the column already exists
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = table_name 
        AND column_name = 'is_staging'
      ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN is_staging BOOLEAN DEFAULT TRUE', table_name);
      END IF;
    END LOOP;
  END IF;
END;
73419;

-- Add a notice to all pages in the staging environment
DO 73419
BEGIN
  IF is_staging_environment() THEN
    -- You can add any staging-specific setup here
    RAISE NOTICE 'Setting up staging environment';
  END IF;
END;
73419;
