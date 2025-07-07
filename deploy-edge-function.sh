#!/bin/bash

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Create the function directory structure
mkdir -p "$TEMP_DIR/supabase/functions/create-payment-intent"
echo "Created function directory structure"

# Copy the function file
cp supabase/functions/create-payment-intent/index.ts "$TEMP_DIR/supabase/functions/create-payment-intent/"
echo "Copied function file"

# Change to the temporary directory
cd "$TEMP_DIR"
echo "Changed to temporary directory"

# Deploy the function
echo "Deploying function..."
npx supabase functions deploy create-payment-intent

# Clean up
echo "Cleaning up..."
cd -
rm -rf "$TEMP_DIR"
echo "Done!"
