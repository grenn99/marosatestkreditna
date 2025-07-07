#!/bin/bash
# Script to set up a staging environment

# Configuration
STAGING_BRANCH="staging"
STAGING_ENV_FILE=".env.staging"
STAGING_SUPABASE_PROJECT="kmetija-marosa-staging"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up staging environment...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}Error: Not in a git repository. Please run this script from within your project repository.${NC}"
    exit 1
fi

# Check if the staging branch exists
if git show-ref --verify --quiet refs/heads/$STAGING_BRANCH; then
    echo -e "${YELLOW}Staging branch already exists. Checking it out...${NC}"
    git checkout $STAGING_BRANCH
else
    echo -e "${YELLOW}Creating staging branch...${NC}"
    git checkout -b $STAGING_BRANCH
fi

# Create staging environment file if it doesn't exist
if [ ! -f "$STAGING_ENV_FILE" ]; then
    echo -e "${YELLOW}Creating staging environment file...${NC}"
    
    # Check if .env file exists to use as a template
    if [ -f ".env" ]; then
        cp .env $STAGING_ENV_FILE
        echo -e "${GREEN}Created $STAGING_ENV_FILE from .env${NC}"
    else
        # Create a basic template
        cat > $STAGING_ENV_FILE << EOL
# Staging Environment Variables
VITE_SUPABASE_URL=https://$STAGING_SUPABASE_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-staging-stripe-key
EOL
        echo -e "${GREEN}Created basic $STAGING_ENV_FILE template${NC}"
    fi
    
    echo -e "${YELLOW}Please edit $STAGING_ENV_FILE with your staging environment values${NC}"
fi

# Create a netlify.toml file for staging if it doesn't exist
if [ ! -f "netlify.toml" ]; then
    echo -e "${YELLOW}Creating netlify.toml file...${NC}"
    
    cat > netlify.toml << EOL
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Production context: all deploys from the main branch
[context.production]
  environment = { NODE_ENV = "production" }

# Deploy Preview context: all deploys generated from a pull/merge request
[context.deploy-preview]
  environment = { NODE_ENV = "production" }

# Staging context: all deploys from the staging branch
[context.staging]
  environment = { NODE_ENV = "production" }
  command = "npm run build:staging"
EOL
    echo -e "${GREEN}Created netlify.toml file${NC}"
fi

# Add staging build script to package.json if it doesn't exist
if ! grep -q "build:staging" package.json; then
    echo -e "${YELLOW}Adding staging build script to package.json...${NC}"
    
    # Use a temporary file for the replacement
    sed -i 's/"scripts": {/"scripts": {\n    "build:staging": "vite build --mode staging",/' package.json
    
    echo -e "${GREEN}Added staging build script to package.json${NC}"
fi

# Create a staging database setup script
echo -e "${YELLOW}Creating staging database setup script...${NC}"

cat > setup-staging-db.sql << EOL
-- Staging Database Setup Script

-- Create a function to check if we're in the staging environment
CREATE OR REPLACE FUNCTION is_staging_environment()
RETURNS BOOLEAN AS $$
BEGIN
  -- This should return true only in the staging environment
  -- You can customize this based on your environment detection method
  RETURN current_database() LIKE '%staging%';
END;
$$ LANGUAGE plpgsql;

-- Add a staging indicator to all tables
DO $$
DECLARE
  table_name text;
BEGIN
  IF is_staging_environment() THEN
    FOR table_name IN 
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    LOOP
      -- Check if the column already exists
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = table_name 
        AND column_name = 'is_staging'
      ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN is_staging BOOLEAN DEFAULT TRUE', table_name);
      END IF;
    END LOOP;
  END IF;
END;
$$;

-- Add a notice to all pages in the staging environment
DO $$
BEGIN
  IF is_staging_environment() THEN
    -- You can add any staging-specific setup here
    RAISE NOTICE 'Setting up staging environment';
  END IF;
END;
$$;
EOL

echo -e "${GREEN}Created setup-staging-db.sql${NC}"

# Create a script to deploy to staging
echo -e "${YELLOW}Creating staging deployment script...${NC}"

cat > deploy-to-staging.sh << EOL
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

echo -e "\${GREEN}Deploying to staging environment...\${NC}"

# Check if we're on the staging branch
CURRENT_BRANCH=\$(git rev-parse --abbrev-ref HEAD)
if [ "\$CURRENT_BRANCH" != "\$STAGING_BRANCH" ]; then
    echo -e "\${YELLOW}Not on staging branch. Checking out \$STAGING_BRANCH...\${NC}"
    git checkout \$STAGING_BRANCH || { echo -e "\${RED}Failed to checkout \$STAGING_BRANCH\${NC}"; exit 1; }
fi

# Check if staging environment file exists
if [ ! -f "\$STAGING_ENV_FILE" ]; then
    echo -e "\${RED}Error: \$STAGING_ENV_FILE does not exist. Please run setup-staging.sh first.\${NC}"
    exit 1
fi

# Copy staging environment file to .env.local for build
cp \$STAGING_ENV_FILE .env.local
echo -e "\${GREEN}Copied \$STAGING_ENV_FILE to .env.local\${NC}"

# Deploy Edge Functions first
echo -e "\${YELLOW}Deploying Edge Functions...\${NC}"
npm run deploy:edge-functions || { echo -e "\${RED}Failed to deploy Edge Functions\${NC}"; exit 1; }

# Build and deploy to Netlify
echo -e "\${YELLOW}Building and deploying to Netlify...\${NC}"
npm run build:staging && npx netlify deploy --prod --message "Staging deployment" || { echo -e "\${RED}Failed to deploy to Netlify\${NC}"; exit 1; }

echo -e "\${GREEN}Successfully deployed to staging environment!\${NC}"
EOL

chmod +x deploy-to-staging.sh
echo -e "${GREEN}Created deploy-to-staging.sh${NC}"

# Add staging environment to .gitignore if it's not already there
if ! grep -q "\.env\.staging" .gitignore; then
    echo -e "${YELLOW}Adding .env.staging to .gitignore...${NC}"
    echo ".env.staging" >> .gitignore
    echo -e "${GREEN}Added .env.staging to .gitignore${NC}"
fi

echo -e "${GREEN}Staging environment setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Edit ${YELLOW}$STAGING_ENV_FILE${NC} with your staging environment values"
echo -e "2. Create a staging project in Supabase"
echo -e "3. Run ${YELLOW}./deploy-to-staging.sh${NC} to deploy to staging"
