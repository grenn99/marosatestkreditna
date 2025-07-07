#!/bin/bash

# This script creates a backup of your Supabase database

# Replace these variables with your actual Supabase connection details
SUPABASE_HOST="db.abcdefghijkl.supabase.co"  # Replace with your actual host
SUPABASE_PORT="5432"                         # Usually 5432
SUPABASE_DB="postgres"                       # Usually postgres
SUPABASE_USER="postgres"                     # Usually postgres
SUPABASE_PASSWORD="your_password_here"       # Replace with your actual password

# Create backup directory if it doesn't exist
mkdir -p backups

# Get current date for backup filename
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/supabase_backup_$BACKUP_DATE.sql"

echo "Creating backup of Supabase database..."
echo "Host: $SUPABASE_HOST"
echo "Database: $SUPABASE_DB"
echo "Output file: $BACKUP_FILE"

# Run pg_dump to create the backup
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
  -h "$SUPABASE_HOST" \
  -p "$SUPABASE_PORT" \
  -U "$SUPABASE_USER" \
  -d "$SUPABASE_DB" \
  -F p \
  -f "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully!"
  echo "Backup saved to: $BACKUP_FILE"
  echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  echo "Backup failed!"
fi
