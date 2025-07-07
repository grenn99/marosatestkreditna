#!/bin/bash
# Script to update Content Security Policy for staging environment

# Configuration
HEADERS_FILE="public/_headers"
STAGING_DOMAIN="marosakreditna-staging.netlify.app"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Updating Content Security Policy for staging environment...${NC}"

# Check if headers file exists
if [ ! -f "$HEADERS_FILE" ]; then
    echo -e "${RED}Error: $HEADERS_FILE does not exist.${NC}"
    exit 1
fi

# Create a backup of the headers file
cp "$HEADERS_FILE" "${HEADERS_FILE}.bak"
echo -e "${GREEN}Created backup of $HEADERS_FILE at ${HEADERS_FILE}.bak${NC}"

# Update the Content-Security-Policy to include the staging domain
sed -i "s/Content-Security-Policy: /Content-Security-Policy: connect-src 'self' https:\/\/$STAGING_DOMAIN https:\/\/*.supabase.co https:\/\/*.stripe.com; /" "$HEADERS_FILE"

# Check if the update was successful
if grep -q "$STAGING_DOMAIN" "$HEADERS_FILE"; then
    echo -e "${GREEN}Successfully updated Content Security Policy to include $STAGING_DOMAIN${NC}"
else
    echo -e "${RED}Failed to update Content Security Policy.${NC}"
    echo -e "${YELLOW}Restoring backup...${NC}"
    mv "${HEADERS_FILE}.bak" "$HEADERS_FILE"
    exit 1
fi

echo -e "${GREEN}Content Security Policy updated successfully!${NC}"
