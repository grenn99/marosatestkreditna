#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Run the migration
echo "Running migration to update gift package translations..."
psql "$(grep POSTGRES_URL .env | cut -d '=' -f2)" -f supabase/migrations/20240504_add_gift_package_translations.sql

echo "Migration completed."
