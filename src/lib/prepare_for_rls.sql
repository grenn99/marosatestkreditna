-- Prepare database tables for Row Level Security

-- Check if created_by column exists in products table, add if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id);
        -- Set default value for existing records (can be updated later)
        UPDATE public.products SET created_by = (
            SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1
        );
    END IF;
END
$$;

-- Check if isActive column exists in products table, add if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE public.products ADD COLUMN isActive BOOLEAN DEFAULT true;
        -- Set all existing products to active
        UPDATE public.products SET isActive = true;
    END IF;
END
$$;

-- Check if is_admin column exists in profiles table, add if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        
        -- Set admin status for known admin emails
        UPDATE public.profiles 
        SET is_admin = true 
        WHERE user_id IN (
            SELECT id FROM auth.users WHERE email IN ('admin@example.com', 'nakupi@si.si')
        );
    END IF;
END
$$;

-- Check if is_active column exists in profiles table, add if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        -- Set all existing profiles to active
        UPDATE public.profiles SET is_active = true;
    END IF;
END
$$;
