#!/bin/bash

# Development Database Restore Script
# This script restores a production backup to the development database

set -e

# Configuration
DEV_HOST="localhost"
DEV_PORT="5432"
DEV_DB="pkmn_tracker_dev"
DEV_USER="dev_user"
DEV_PASSWORD="dev_password"
BACKUP_DIR="./backups"

# Function to list available backups
list_backups() {
    echo "📋 Available backups:"
    ls -la "$BACKUP_DIR"/*.sql 2>/dev/null | while read -r line; do
        echo "  $line"
    done
    echo ""
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "❌ No backup file specified!"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 ./backups/prod_backup_20250118_143022.sql"
    echo ""
    list_backups
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    echo ""
    list_backups
    exit 1
fi

echo "🔄 Restoring production backup to development database..."
echo "📁 Backup file: $BACKUP_FILE"
echo "🎯 Target database: $DEV_DB"

# Check if development database is running
if ! docker-compose ps | grep -q "pkmn_tracker_db.*Up"; then
    echo "❌ Development database is not running!"
    echo "Start it with: docker-compose up -d"
    exit 1
fi

# Restore the backup
echo "📥 Restoring data..."
PGPASSWORD="$DEV_PASSWORD" psql -h "$DEV_HOST" -p "$DEV_PORT" -U "$DEV_USER" -d "$DEV_DB" < "$BACKUP_FILE"

echo "✅ Restore completed successfully!"
echo "🎉 Development database now contains production data"
echo ""
echo "💡 Next steps:"
echo "  1. Update Prisma schema if needed"
echo "  2. Run: npx prisma generate"
echo "  3. Test your application with the dev database" 