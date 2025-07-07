#!/bin/bash

# Apply the marketing tables migration
echo "Applying marketing tables migration..."
npx supabase migration up

# Verify the tables were created
echo "Verifying tables were created..."
npx supabase db execute "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('meta_tags', 'discount_codes', 'gift_options', 'product_bundles', 'product_bundle_items', 'newsletter_subscribers', 'referral_codes')"

echo "Migration complete!"
