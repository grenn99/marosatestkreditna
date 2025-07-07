#!/bin/bash

# Check if NETLIFY_AUTH_TOKEN is provided
if [ -z "$1" ]; then
  echo "Error: Netlify auth token is required."
  echo "Usage: ./deploy-netlify.sh YOUR_NETLIFY_AUTH_TOKEN"
  exit 1
fi

# Set the Netlify auth token
export NETLIFY_AUTH_TOKEN=$1

# Export environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
node netlify-direct-deploy.js
