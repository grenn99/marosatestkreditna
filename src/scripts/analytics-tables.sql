-- SQL functions to create analytics tables in Supabase

-- Function to create the analytics_events table
CREATE OR REPLACE FUNCTION create_analytics_events_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the analytics_events table if it doesn't exist
  CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    session_id TEXT NOT NULL,
    user_id TEXT,
    url TEXT,
    referrer TEXT,
    user_agent TEXT,
    product_id TEXT,
    category TEXT,
    label TEXT,
    value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Add indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON analytics_events(product_id);

  -- Set up RLS (Row Level Security)
  ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

  -- Create policies
  -- Allow anyone to insert analytics events (for client-side tracking)
  DROP POLICY IF EXISTS "Allow anonymous inserts" ON analytics_events;
  CREATE POLICY "Allow anonymous inserts" ON analytics_events FOR INSERT TO anon WITH CHECK (true);

  -- Only allow admins to select, update, or delete
  DROP POLICY IF EXISTS "Allow admins full access" ON analytics_events;
  CREATE POLICY "Allow admins full access" ON analytics_events FOR ALL TO authenticated USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );
END;
$$;

-- Function to create the analytics_daily_metrics table
CREATE OR REPLACE FUNCTION create_analytics_daily_metrics_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the analytics_daily_metrics table if it doesn't exist
  CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    page_views INTEGER NOT NULL DEFAULT 0,
    product_views INTEGER NOT NULL DEFAULT 0,
    add_to_cart_events INTEGER NOT NULL DEFAULT 0,
    checkout_events INTEGER NOT NULL DEFAULT 0,
    purchase_events INTEGER NOT NULL DEFAULT 0,
    bounce_rate INTEGER NOT NULL DEFAULT 0,
    conversion_rate INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Add index for date
  CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_date ON analytics_daily_metrics(date);

  -- Set up RLS (Row Level Security)
  ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;

  -- Create policies
  -- Only allow admins to insert, select, update, or delete
  DROP POLICY IF EXISTS "Allow admins full access" ON analytics_daily_metrics;
  CREATE POLICY "Allow admins full access" ON analytics_daily_metrics FOR ALL TO authenticated USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );
END;
$$;
