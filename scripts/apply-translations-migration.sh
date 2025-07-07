#!/bin/bash

# Apply the translations migration to the Supabase database
# This script requires the Supabase CLI to be installed

# Set variables
MIGRATION_FILE="supabase/migrations/20240521000000_create_translations_table.sql"

# Check if SUPABASE_DB_URL is set, otherwise prompt for connection details
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "SUPABASE_DB_URL environment variable is not set."
  echo "Please enter your database connection details:"

  read -p "Host (default: localhost): " DB_HOST
  DB_HOST=${DB_HOST:-localhost}

  read -p "Port (default: 5432): " DB_PORT
  DB_PORT=${DB_PORT:-5432}

  read -p "Database name (default: postgres): " DB_NAME
  DB_NAME=${DB_NAME:-postgres}

  read -p "Username (default: postgres): " DB_USER
  DB_USER=${DB_USER:-postgres}

  read -s -p "Password (default: postgres): " DB_PASS
  echo
  DB_PASS=${DB_PASS:-postgres}

  DB_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
else
  DB_URL="$SUPABASE_DB_URL"
fi

echo "Using database connection: ${DB_URL//:*@/:***@}"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "Error: psql is not installed. Please install PostgreSQL client tools."
  exit 1
fi

echo "Applying translation migration to database..."

# Apply the migration
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error: Failed to apply migration."
  exit 1
fi

echo "Checking if translations table exists..."

# Check if the table exists
TABLE_EXISTS=$(psql -t -A "$DB_URL" -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'translations');")

if [ "$TABLE_EXISTS" = "t" ]; then
  echo "Translations table exists!"

  # Count the number of translations
  TRANSLATION_COUNT=$(psql -t -A "$DB_URL" -c "SELECT COUNT(*) FROM translations;")
  echo "Number of translations: $TRANSLATION_COUNT"
else
  echo "Error: Translations table does not exist after migration."
  exit 1
fi

echo "Migration completed successfully."
