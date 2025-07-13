#!/bin/bash

# Update system packages
sudo apt-get update

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm installation
node --version
npm --version

# Navigate to the workspace directory
cd /mnt/persist/workspace

# Install project dependencies
npm ci

# Add npm global bin to PATH
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> $HOME/.profile
mkdir -p $HOME/.npm-global
npm config set prefix $HOME/.npm-global

# Source the profile to update PATH
source $HOME/.profile

# Verify installation by checking if vitest is available
npx vitest --version

echo "Setup completed successfully!"