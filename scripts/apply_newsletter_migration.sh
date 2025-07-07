#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Applying newsletter subscribers table migration...${NC}"

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Run the migration
npx supabase migration up

# Verify the changes
echo -e "${YELLOW}Verifying changes to newsletter_subscribers table...${NC}"
npx supabase db execute "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers' ORDER BY ordinal_position;"

echo -e "${GREEN}Migration completed successfully!${NC}"
