#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

echo "Build successful!"
echo ""
echo "To deploy to Netlify:"
echo "1. Go to https://app.netlify.com/drop"
echo "2. Drag and drop the 'dist' folder from your project"
echo "3. Wait for the deployment to complete"
echo ""
echo "Alternatively, you can connect your GitHub repository to Netlify for automatic deployments."
echo "Visit https://app.netlify.com/start to get started."
