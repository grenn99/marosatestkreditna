#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Applying newsletter permissions...${NC}"

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Apply the permissions directly using the SQL file
npx supabase db execute -f supabase/migrations/20240602_newsletter_permissions.sql

echo -e "${GREEN}Newsletter permissions applied successfully!${NC}"
