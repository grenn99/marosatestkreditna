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
