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
