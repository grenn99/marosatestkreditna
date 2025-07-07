-- Step 3: Add necessary columns to tables
-- This script adds columns needed for RLS policies

-- First, let's check the current structure of the tables
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('products', 'profiles', 'profiles_guest')
ORDER BY table_name, column_name;

-- Add necessary columns to products table
DO $$
BEGIN
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        -- Set default value for existing records (can be updated later)
        -- First, find an admin user
        DECLARE
            admin_id UUID;
        BEGIN
            SELECT id INTO admin_id FROM auth.users 
            WHERE email IN ('admin@example.com', 'nakupi@si.si') 
            LIMIT 1;
            
            IF admin_id IS NOT NULL THEN
                UPDATE public.products SET created_by = admin_id;
            END IF;
        END;
    END IF;

    -- Add isActive column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'isActive'
    ) THEN
        ALTER TABLE public.products ADD COLUMN "isActive" BOOLEAN DEFAULT true;
        
        -- Set all existing products to active
        UPDATE public.products SET "isActive" = true;
    END IF;
END
$$;

-- Add necessary columns to profiles table
DO $$
BEGIN
    -- Add is_admin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN "is_admin" BOOLEAN DEFAULT false;
        
        -- Set admin status for known admin emails
        UPDATE public.profiles p
        SET "is_admin" = true 
        FROM auth.users u
        WHERE p.id = u.id AND u.email IN ('admin@example.com', 'nakupi@si.si');
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN "is_active" BOOLEAN DEFAULT true;
        
        -- Set all existing profiles to active
        UPDATE public.profiles SET "is_active" = true;
    END IF;
END
$$;

-- Add necessary columns to profiles_guest table
DO $$
BEGIN
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles_guest' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.profiles_guest ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END
$$;

-- Verify columns were added
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE (table_name = 'products' AND column_name IN ('created_by', 'isActive'))
   OR (table_name = 'profiles' AND column_name IN ('is_admin', 'is_active'))
   OR (table_name = 'profiles_guest' AND column_name = 'created_by')
ORDER BY table_name, column_name;
