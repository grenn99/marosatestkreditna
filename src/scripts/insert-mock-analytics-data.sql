-- Insert mock analytics data for testing date range filters
-- This script inserts data for today, the past 7 days, 30 days, and 90 days

-- First, let's clear existing data (optional - comment this out if you want to keep existing data)
-- DELETE FROM analytics_events;
-- DELETE FROM analytics_daily_metrics;

-- Function to generate random session IDs
CREATE OR REPLACE FUNCTION random_uuid() RETURNS uuid AS $$
BEGIN
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Function to generate random user agents
CREATE OR REPLACE FUNCTION random_user_agent() RETURNS text AS $$
DECLARE
    agents text[] := ARRAY[
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    ];
BEGIN
    RETURN agents[floor(random() * array_length(agents, 1)) + 1];
END;
$$ LANGUAGE plpgsql;

-- Function to generate random referrers
CREATE OR REPLACE FUNCTION random_referrer() RETURNS text AS $$
DECLARE
    referrers text[] := ARRAY[
        'https://www.google.com/',
        'https://www.facebook.com/',
        'https://www.instagram.com/',
        'https://www.twitter.com/',
        'https://www.linkedin.com/',
        'https://www.pinterest.com/',
        '',  -- Direct traffic
        ''   -- Direct traffic
    ];
BEGIN
    RETURN referrers[floor(random() * array_length(referrers, 1)) + 1];
END;
$$ LANGUAGE plpgsql;

-- Function to generate random URLs
CREATE OR REPLACE FUNCTION random_url() RETURNS text AS $$
DECLARE
    urls text[] := ARRAY[
        '/',
        '/products',
        '/about',
        '/contact',
        '/product/1',
        '/product/2',
        '/product/3',
        '/product/4',
        '/product/5',
        '/product/10',
        '/product/11'
    ];
BEGIN
    RETURN urls[floor(random() * array_length(urls, 1)) + 1];
END;
$$ LANGUAGE plpgsql;

-- Function to generate random product IDs
CREATE OR REPLACE FUNCTION random_product_id() RETURNS integer AS $$
DECLARE
    product_ids integer[] := ARRAY[1, 2, 3, 4, 5, 10, 11];
BEGIN
    RETURN product_ids[floor(random() * array_length(product_ids, 1)) + 1];
END;
$$ LANGUAGE plpgsql;

-- Insert mock data for the past 90 days
DO $$
DECLARE
    session_ids uuid[] := ARRAY[]::uuid[];
    curr_date timestamp;
    i integer;
    j integer;
    random_session uuid;
    product_id integer;
    event_type text;
    category text;
    action text;
    url text;
    session_count integer;
    page_view_count integer;
    product_views jsonb;
    day_date date;
BEGIN
    -- Generate 100 random session IDs
    FOR i IN 1..100 LOOP
        session_ids := array_append(session_ids, random_uuid());
    END LOOP;

    -- Insert data for the past 90 days
    FOR i IN 0..90 LOOP
        curr_date := NOW() - (i || ' days')::interval;
        day_date := curr_date::date;
        
        -- Reset counters for this day
        session_count := 0;
        page_view_count := 0;
        product_views := '{}'::jsonb;
        
        -- Generate between 10-50 events per day
        FOR j IN 1..floor(random() * 40 + 10) LOOP
            -- Pick a random session ID (simulate returning visitors)
            random_session := session_ids[floor(random() * array_length(session_ids, 1)) + 1];
            
            -- Increment session count only once per session per day
            IF NOT EXISTS (
                SELECT 1 FROM analytics_events 
                WHERE session_id = random_session 
                AND created_at::date = day_date
            ) THEN
                session_count := session_count + 1;
            END IF;
            
            -- Determine event type
            IF random() < 0.7 THEN
                -- 70% chance of page view
                event_type := 'page_view';
                category := 'navigation';
                action := 'page_view';
                url := random_url();
                page_view_count := page_view_count + 1;
            ELSIF random() < 0.8 THEN
                -- 24% chance of product view (70% + 30%*80%)
                event_type := 'ecommerce';
                category := 'ecommerce';
                action := 'view_product';
                product_id := random_product_id();
                url := '/product/' || product_id;
                
                -- Update product views count
                IF product_views ? product_id::text THEN
                    product_views := jsonb_set(
                        product_views, 
                        ARRAY[product_id::text], 
                        ((product_views ->> product_id::text)::integer + 1)::text::jsonb
                    );
                ELSE
                    product_views := product_views || jsonb_build_object(product_id::text, 1);
                END IF;
            ELSE
                -- 6% chance of other events
                event_type := 'event';
                category := 'engagement';
                action := 'click';
                url := random_url();
            END IF;
            
            -- Insert event
            INSERT INTO analytics_events (
                event_type,
                category,
                action,
                url,
                referrer,
                user_agent,
                session_id,
                product_id,
                created_at
            ) VALUES (
                event_type,
                category,
                action,
                url,
                random_referrer(),
                random_user_agent(),
                random_session,
                CASE WHEN action = 'view_product' THEN product_id ELSE NULL END,
                curr_date - (random() * '24 hours'::interval)
            );
        END LOOP;
        
        -- Insert daily metrics
        INSERT INTO analytics_daily_metrics (
            date,
            page_views,
            unique_visitors,
            product_views,
            bounce_rate,
            conversion_rate,
            created_at,
            updated_at
        ) VALUES (
            day_date,
            page_view_count,
            session_count,
            product_views,
            floor(random() * 100), -- Random bounce rate
            floor(random() * 10),  -- Random conversion rate
            day_date + '12:00:00'::interval,
            day_date + '23:59:59'::interval
        );
    END LOOP;
END $$;

-- Add more recent data for today with higher volume
DO $$
DECLARE
    session_ids uuid[] := ARRAY[]::uuid[];
    curr_date timestamp;
    i integer;
    random_session uuid;
    product_id integer;
    event_type text;
    category text;
    action text;
    url text;
    session_count integer := 0;
    page_view_count integer := 0;
    product_views jsonb := '{}'::jsonb;
    today_date date := CURRENT_DATE;
BEGIN
    -- Generate 50 new session IDs for today
    FOR i IN 1..50 LOOP
        session_ids := array_append(session_ids, random_uuid());
    END LOOP;
    
    curr_date := NOW();
    
    -- Generate 100-200 events for today
    FOR i IN 1..floor(random() * 100 + 100) LOOP
        -- Pick a random session ID
        random_session := session_ids[floor(random() * array_length(session_ids, 1)) + 1];
        
        -- Increment session count only once per session
        IF NOT EXISTS (
            SELECT 1 FROM analytics_events 
            WHERE session_id = random_session 
            AND created_at::date = today_date
        ) THEN
            session_count := session_count + 1;
        END IF;
        
        -- Determine event type
        IF random() < 0.7 THEN
            -- 70% chance of page view
            event_type := 'page_view';
            category := 'navigation';
            action := 'page_view';
            url := random_url();
            page_view_count := page_view_count + 1;
        ELSIF random() < 0.8 THEN
            -- 24% chance of product view
            event_type := 'ecommerce';
            category := 'ecommerce';
            action := 'view_product';
            product_id := random_product_id();
            url := '/product/' || product_id;
            
            -- Update product views count
            IF product_views ? product_id::text THEN
                product_views := jsonb_set(
                    product_views, 
                    ARRAY[product_id::text], 
                    ((product_views ->> product_id::text)::integer + 1)::text::jsonb
                );
            ELSE
                product_views := product_views || jsonb_build_object(product_id::text, 1);
            END IF;
        ELSE
            -- 6% chance of other events
            event_type := 'event';
            category := 'engagement';
            action := 'click';
            url := random_url();
        END IF;
        
        -- Insert event
        INSERT INTO analytics_events (
            event_type,
            category,
            action,
            url,
            referrer,
            user_agent,
            session_id,
            product_id,
            created_at
        ) VALUES (
            event_type,
            category,
            action,
            url,
            random_referrer(),
            random_user_agent(),
            random_session,
            CASE WHEN action = 'view_product' THEN product_id ELSE NULL END,
            curr_date - (random() * '12 hours'::interval)
        );
    END LOOP;
    
    -- Update or insert daily metrics for today
    IF EXISTS (SELECT 1 FROM analytics_daily_metrics WHERE date = today_date) THEN
        UPDATE analytics_daily_metrics
        SET 
            page_views = page_view_count,
            unique_visitors = session_count,
            product_views = product_views,
            updated_at = NOW()
        WHERE date = today_date;
    ELSE
        INSERT INTO analytics_daily_metrics (
            date,
            page_views,
            unique_visitors,
            product_views,
            bounce_rate,
            conversion_rate,
            created_at,
            updated_at
        ) VALUES (
            today_date,
            page_view_count,
            session_count,
            product_views,
            floor(random() * 100), -- Random bounce rate
            floor(random() * 10),  -- Random conversion rate
            NOW() - '6 hours'::interval,
            NOW()
        );
    END IF;
END $$;

-- Clean up temporary functions
DROP FUNCTION IF EXISTS random_uuid();
DROP FUNCTION IF EXISTS random_user_agent();
DROP FUNCTION IF EXISTS random_referrer();
DROP FUNCTION IF EXISTS random_url();
DROP FUNCTION IF EXISTS random_product_id();

-- Analyze tables for better query performance
ANALYZE analytics_events;
ANALYZE analytics_daily_metrics;

-- Output summary
SELECT 'Analytics events created: ' || COUNT(*) FROM analytics_events;
SELECT 'Daily metrics created: ' || COUNT(*) FROM analytics_daily_metrics;
SELECT 'Date range: ' || MIN(date) || ' to ' || MAX(date) FROM analytics_daily_metrics;
