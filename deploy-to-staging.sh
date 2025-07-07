#!/bin/bash
# Script to deploy to staging environment

# Configuration
STAGING_BRANCH="staging"
STAGING_ENV_FILE=".env.staging"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying to staging environment...${NC}"

# Check if we're on the staging branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$STAGING_BRANCH" ]; then
    echo -e "${YELLOW}Not on staging branch. Checking out $STAGING_BRANCH...${NC}"
    git checkout $STAGING_BRANCH || { echo -e "${RED}Failed to checkout $STAGING_BRANCH${NC}"; exit 1; }
fi

# Check if staging environment file exists
if [ ! -f "$STAGING_ENV_FILE" ]; then
    echo -e "${RED}Error: $STAGING_ENV_FILE does not exist. Please run setup-staging.sh first.${NC}"
    exit 1
fi

# Copy staging environment file to .env.local for build
cp $STAGING_ENV_FILE .env.local
echo -e "${GREEN}Copied $STAGING_ENV_FILE to .env.local${NC}"

# Deploy Edge Functions first
echo -e "${YELLOW}Deploying Edge Functions...${NC}"
npm run deploy:edge-functions || { echo -e "${RED}Failed to deploy Edge Functions${NC}"; exit 1; }

# Build and deploy to Netlify
echo -e "${YELLOW}Building and deploying to Netlify...${NC}"
npm run build:staging && npx netlify deploy --prod --message "Staging deployment" || { echo -e "${RED}Failed to deploy to Netlify${NC}"; exit 1; }

echo -e "${GREEN}Successfully deployed to staging environment!${NC}"
