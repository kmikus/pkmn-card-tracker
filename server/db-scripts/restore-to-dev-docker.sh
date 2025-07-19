#!/bin/bash

# Restore production backup to development database using Docker
# Usage: ./scripts/restore-to-dev-docker.sh <backup_file>

set -e

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "❌ No backup file specified!"
    echo ""
    echo "Usage: ./scripts/restore-to-dev-docker.sh <backup_file>"
    echo ""
    echo "Example:"
    echo "  ./scripts/restore-to-dev-docker.sh ./backups/prod_backup_20250719_145329.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring production backup to development database..."
echo "📁 Backup file: $BACKUP_FILE"
echo "🎯 Target database: pkmn_tracker_dev"
echo "📥 Restoring data..."

# Get the absolute path of the backup file
BACKUP_FILE_ABS=$(cd "$(dirname "$BACKUP_FILE")" && pwd)/$(basename "$BACKUP_FILE")

# Use Docker to run psql and restore the backup
docker run --rm \
    -v "$BACKUP_FILE_ABS:/backup.sql" \
    --network host \
    -e PGPASSWORD=dev_password \
    postgres:16 \
    psql -h localhost -p 5432 -U dev_user -d pkmn_tracker_dev -f /backup.sql

echo "✅ Restore completed successfully!"
echo ""
echo "💡 Next steps:"
echo "  1. Run: npx prisma generate"
echo "  2. Start your server: npm run dev"
echo ""
echo "🎉 Your development database now has production data!" 