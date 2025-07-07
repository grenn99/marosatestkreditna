#!/bin/bash

# Script to run the migration to fix the gift_product_id type in the orders table

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running migration to fix gift_product_id type in orders table...${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Run the migration
echo -e "${YELLOW}Applying migration: 20240503_fix_gift_product_id_type.sql${NC}"
npx supabase db execute -f supabase/migrations/20240503_fix_gift_product_id_type.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Migration applied successfully!${NC}"
    echo -e "${YELLOW}Verifying the changes...${NC}"
    
    # Verify the changes by checking the column type
    npx supabase db execute "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name IN ('gift_product_id', 'gift_product_package_id', 'gift_product_cost');"
    
    echo -e "${GREEN}Done!${NC}"
else
    echo -e "${RED}Migration failed. Please check the error message above.${NC}"
    exit 1
fi
