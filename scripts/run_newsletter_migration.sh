#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running newsletter subscribers table migration...${NC}"

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Make the script executable
chmod +x scripts/apply_newsletter_migration.sh

# Run the migration script
./scripts/apply_newsletter_migration.sh

echo -e "${GREEN}Migration completed!${NC}"
echo -e "${YELLOW}Now you need to update the Supabase Edge Function for sending emails.${NC}"
echo -e "${YELLOW}Please update the send-email function to handle confirmation and welcome emails.${NC}"
