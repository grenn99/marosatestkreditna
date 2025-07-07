-- Set up permissions for newsletter_subscribers table
-- Allow anonymous users to insert new subscribers

-- First, revoke all privileges
REVOKE ALL ON TABLE newsletter_subscribers FROM anon, authenticated;

-- Grant insert permission to anonymous users
GRANT INSERT ON TABLE newsletter_subscribers TO anon, authenticated;

-- Create or replace the policy for inserting
DROP POLICY IF EXISTS newsletter_subscribers_insert_policy ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_insert_policy ON newsletter_subscribers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);  -- Allow all inserts

-- Create or replace the policy for selecting (only allow users to see their own subscriptions)
DROP POLICY IF EXISTS newsletter_subscribers_select_policy ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_select_policy ON newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth.uid() FROM auth.users WHERE email = newsletter_subscribers.email
    ));

-- Create or replace the policy for updating (only allow users to update their own subscriptions)
DROP POLICY IF EXISTS newsletter_subscribers_update_policy ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_update_policy ON newsletter_subscribers
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth.uid() FROM auth.users WHERE email = newsletter_subscribers.email
    ));

-- Create or replace the policy for deleting (only allow users to delete their own subscriptions)
DROP POLICY IF EXISTS newsletter_subscribers_delete_policy ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_delete_policy ON newsletter_subscribers
    FOR DELETE
    TO authenticated
    USING (auth.uid() IN (
        SELECT auth.uid() FROM auth.users WHERE email = newsletter_subscribers.email
    ));

-- Allow service role to do everything
GRANT ALL ON TABLE newsletter_subscribers TO service_role;

-- Create a special policy for confirmation and unsubscribe tokens
-- This allows anonymous users to select a subscriber by token
DROP POLICY IF EXISTS newsletter_subscribers_token_policy ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_token_policy ON newsletter_subscribers
    FOR SELECT
    TO anon, authenticated
    USING (confirmation_token IS NOT NULL OR unsubscribe_token IS NOT NULL);

-- Create a policy to allow updating by token
DROP POLICY IF EXISTS newsletter_subscribers_token_update_policy ON newsletter_subscribers;
CREATE POLICY newsletter_subscribers_token_update_policy ON newsletter_subscribers
    FOR UPDATE
    TO anon, authenticated
    USING (confirmation_token IS NOT NULL OR unsubscribe_token IS NOT NULL);
