#!/bin/bash

# Secure deployment script with security checks

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting secure deployment process...${NC}"

# Step 1: Verify environment variables
echo -e "\n${YELLOW}Step 1: Verifying environment variables...${NC}"
npm run verify-env
if [ $? -ne 0 ]; then
  echo -e "${RED}Environment variable verification failed. Please fix the issues before deploying.${NC}"
  exit 1
fi
echo -e "${GREEN}Environment variables verified successfully.${NC}"

# Step 2: Run linting
echo -e "\n${YELLOW}Step 2: Running linting...${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Linting found issues. Please review them before continuing.${NC}"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}Linting completed.${NC}"

# Step 3: Build the application
echo -e "\n${YELLOW}Step 3: Building the application...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Please fix the issues before deploying.${NC}"
  exit 1
fi
echo -e "${GREEN}Build completed successfully.${NC}"

# Step 4: Deploy Edge Functions
echo -e "\n${YELLOW}Step 4: Deploying Edge Functions...${NC}"
echo -e "The application requires the 'check-admin-role' Edge Function to be deployed to Supabase."
read -p "Do you want to deploy Edge Functions now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run deploy:edge-functions
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Edge Functions deployment may have encountered issues.${NC}"
    read -p "Continue with deployment anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}Deployment aborted.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}Edge Functions deployed successfully.${NC}"
  fi
else
  echo -e "${YELLOW}Skipping Edge Functions deployment.${NC}"
  echo -e "${YELLOW}Remember to deploy the Edge Functions manually before using the application.${NC}"
fi

# Step 5: Final confirmation
echo -e "\n${YELLOW}Step 5: Final confirmation...${NC}"
echo -e "The application is ready to be deployed to Netlify."
echo -e "Please ensure you have:"
echo -e "  - Deployed the Supabase Edge Function 'check-admin-role'"
echo -e "  - Updated Netlify environment variables"
echo -e "  - Rotated all secrets"
read -p "Are you ready to deploy? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Deployment aborted.${NC}"
  exit 1
fi

# Step 6: Deploy to Netlify
echo -e "\n${YELLOW}Step 6: Deploying to Netlify...${NC}"
npm run deploy:netlify
if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment failed. Please check the logs for more information.${NC}"
  exit 1
fi

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "Please verify the deployment by:"
echo -e "  - Testing all functionality in the production environment"
echo -e "  - Checking for any security issues"
echo -e "  - Verifying that admin functionality works correctly"
echo -e "  - Ensuring that encrypted data is properly handled"

exit 0
