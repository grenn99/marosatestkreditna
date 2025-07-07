-- Update newsletter_subscribers table to add fields for subscription preferences and confirmation status

-- Add confirmation_status field
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmation_status TEXT NOT NULL DEFAULT 'pending';
COMMENT ON COLUMN newsletter_subscribers.confirmation_status IS 'Status of email confirmation: pending, confirmed, or rejected';

-- Add confirmation_token field
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
COMMENT ON COLUMN newsletter_subscribers.confirmation_token IS 'Token used for confirming subscription';

-- Add confirmation_sent_at field
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN newsletter_subscribers.confirmation_sent_at IS 'When the confirmation email was sent';

-- Add confirmed_at field
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN newsletter_subscribers.confirmed_at IS 'When the subscription was confirmed';

-- Add last_emailed_at field
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS last_emailed_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN newsletter_subscribers.last_emailed_at IS 'When the last newsletter was sent to this subscriber';

-- Add unsubscribe_token field
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;
COMMENT ON COLUMN newsletter_subscribers.unsubscribe_token IS 'Token used for unsubscribing';

-- Add source field if it doesn't exist
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS source TEXT;
COMMENT ON COLUMN newsletter_subscribers.source IS 'Where the subscriber signed up from';

-- Add discount_used field if it doesn't exist
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS discount_used TEXT;
COMMENT ON COLUMN newsletter_subscribers.discount_used IS 'Discount code given to subscriber';

-- Add preferences field as JSONB
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"product_updates": true, "promotions": true, "recipes": true}';
COMMENT ON COLUMN newsletter_subscribers.preferences IS 'Subscriber preferences for different types of content';

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Add index on confirmation_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_confirmation_token ON newsletter_subscribers(confirmation_token);

-- Add index on unsubscribe_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);

-- Update existing records to have unsubscribe tokens
UPDATE newsletter_subscribers
SET unsubscribe_token = encode(gen_random_bytes(32), 'hex')
WHERE unsubscribe_token IS NULL;

-- Create a function to generate a random token
CREATE OR REPLACE FUNCTION generate_random_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set confirmation_token and unsubscribe_token on insert
CREATE OR REPLACE FUNCTION set_subscriber_tokens()
RETURNS TRIGGER AS $$
BEGIN
  NEW.confirmation_token := encode(gen_random_bytes(32), 'hex');
  NEW.unsubscribe_token := encode(gen_random_bytes(32), 'hex');
  NEW.confirmation_sent_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_subscriber_tokens_trigger ON newsletter_subscribers;

-- Create the trigger
CREATE TRIGGER set_subscriber_tokens_trigger
BEFORE INSERT ON newsletter_subscribers
FOR EACH ROW
WHEN (NEW.confirmation_token IS NULL OR NEW.unsubscribe_token IS NULL)
EXECUTE FUNCTION set_subscriber_tokens();
