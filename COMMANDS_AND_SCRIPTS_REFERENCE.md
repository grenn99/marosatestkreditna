# Commands and Scripts Reference Guide

This document contains all the commands and scripts created during our development session. Use this as a reference to remember how to use the various tools and scripts we've implemented.

## Table of Contents

1. [Database Backup](#database-backup)
2. [Image Handling](#image-handling)
3. [Error Monitoring](#error-monitoring)
4. [Staging Environment](#staging-environment)
5. [Automated Testing](#automated-testing)
6. [Deployment](#deployment)

---

## Database Backup

### Backup Scripts

#### backup-supabase.sh
```bash
#!/bin/bash
# Automated Supabase database backup script

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/supabase_backup_$TIMESTAMP.sql"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Log start
echo "Starting Supabase database backup at $(date)"

# Export critical tables
echo "Exporting critical tables..."
npx supabase db dump -f "$BACKUP_FILE" --db-url "$SUPABASE_DB_URL"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
  
  # Compress the backup file
  gzip "$BACKUP_FILE"
  echo "Backup compressed: $BACKUP_FILE.gz"
  
  # Remove old backups
  echo "Removing backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "supabase_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
else
  echo "Backup failed!"
fi

echo "Backup process completed at $(date)"
```

#### export_critical_tables.sh
```bash
#!/bin/bash
# Script to export critical tables from Supabase

# Configuration
BACKUP_DIR="./backups/tables"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Log start
echo "Starting critical tables export at $(date)"

# List of critical tables to export
TABLES=("products" "orders" "profiles" "profiles_guest" "invoices")

# Export each table
for TABLE in "${TABLES[@]}"; do
  BACKUP_FILE="$BACKUP_DIR/${TABLE}_backup_$TIMESTAMP.json"
  echo "Exporting table: $TABLE to $BACKUP_FILE"
  
  # Use Supabase CLI to export the table
  npx supabase db dump -t "$TABLE" --data-only -f "$BACKUP_FILE.tmp"
  
  # Convert to JSON format for easier restoration if needed
  cat "$BACKUP_FILE.tmp" | jq '.' > "$BACKUP_FILE" 2>/dev/null
  rm "$BACKUP_FILE.tmp"
  
  # Check if export was successful
  if [ -s "$BACKUP_FILE" ]; then
    echo "Export of $TABLE completed successfully"
    # Compress the backup file
    gzip "$BACKUP_FILE"
  else
    echo "Export of $TABLE failed or table is empty"
    rm "$BACKUP_FILE" 2>/dev/null
  fi
done

# Remove old backups
echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*_backup_*.json.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Critical tables export completed at $(date)"
```

### Running Backup Scripts

```bash
# Make scripts executable
chmod +x backup-supabase.sh export_critical_tables.sh

# Run database backup
./backup-supabase.sh

# Export critical tables
./export_critical_tables.sh
```

---

## Image Handling

### Image Utilities

The enhanced image utilities are in `src/utils/imageUtils.ts`. Key functions:

```typescript
// Get image URL with fallback
getImageUrl(path: string, fallbackUrl: string = DEFAULT_FALLBACK_IMAGE): string

// Validate image URL
validateImageUrl(url: string): Promise<boolean>

// Process multiple product images
processProductImages(
  mainImage: string | undefined, 
  additionalImages: string[] | undefined
): Promise<{ mainImageUrl: string, validAdditionalImages: string[] }>
```

### Placeholder Image

A placeholder SVG is created at `public/images/placeholder.svg`.

---

## Error Monitoring

### Error Monitoring Utilities

The error monitoring system is in `src/utils/errorMonitoring.ts`. Key functions:

```typescript
// Track an error
trackError(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  source: string = 'unknown',
  metadata: Record<string, any> = {},
  userId?: string
): void

// Get stored errors (for development)
getStoredErrors(): ErrorData[]

// Clear stored errors (for development)
clearStoredErrors(): void

// Create an error handler for async operations
createErrorHandler(
  source: string,
  type: ErrorType = ErrorType.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  metadata: Record<string, any> = {},
  userId?: string
): (error: any) => void
```

### Error Boundary Component

The ErrorBoundary component in `src/components/ErrorBoundary.tsx` catches and handles React component errors.

### Error Monitor Component

The ErrorMonitor component in `src/components/ErrorMonitor.tsx` displays errors in development mode.

---

## Staging Environment

### Staging Setup Script

#### setup-staging.sh
```bash
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
```

#### update-csp-for-staging.sh
```bash
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
```

### Setting Up Staging Environment

```bash
# Make scripts executable
chmod +x setup-staging.sh update-csp-for-staging.sh

# Set up staging environment
./setup-staging.sh

# Update CSP for staging
./update-csp-for-staging.sh

# Deploy to staging
./deploy-to-staging.sh
```

---

## Automated Testing

### Testing Setup

#### Installing Testing Dependencies

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Configuration

The test configuration is in `vitest.config.ts`.

### Test Utilities

Test utilities and mocks are in `src/test/`.

---

## Deployment

### Deployment Scripts

#### deploy-to-netlify.sh
```bash
#!/bin/bash
# Script to deploy to Netlify

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying to Netlify...${NC}"

# Deploy Edge Functions first
echo -e "${YELLOW}Deploying Edge Functions...${NC}"
npm run deploy:edge-functions || { echo -e "${RED}Failed to deploy Edge Functions${NC}"; exit 1; }

# Build and deploy to Netlify
echo -e "${YELLOW}Building and deploying to Netlify...${NC}"
npm run build && npx netlify deploy --prod --message "Production deployment" || { echo -e "${RED}Failed to deploy to Netlify${NC}"; exit 1; }

echo -e "${GREEN}Successfully deployed to Netlify!${NC}"
```

### Deployment Commands

```bash
# Deploy Edge Functions
npm run deploy:edge-functions

# Deploy to Netlify
npm run deploy:netlify

# Direct deployment
npm run deploy:direct

# Secure deployment
npm run deploy:secure
```

---

## Git Commands

```bash
# Create a new branch
git checkout -b branch-name

# Add files to staging
git add .

# Commit changes
git commit -m "Commit message"

# Push changes
git push origin branch-name

# Switch to a branch
git checkout branch-name

# View commit history
git log

# View status of files
git status
```

---

## Additional Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Verify environment variables
npm run verify-env

# Security check
npm run security-check
```

---

This document will be updated as new commands and scripts are added to the project.
