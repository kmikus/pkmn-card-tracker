#!/bin/bash

# Production Database Backup Script (Docker Version)
# This script creates a backup of your production database using Docker

set -e

# Load environment variables from .env.production file if it exists
if [ -f ".env.production" ]; then
    echo "📄 Loading environment variables from .env.production file..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Configuration - Production database details
PROD_HOST="dpg-d1k1d7a4d50c738mvsu0-a.oregon-postgres.render.com"
PROD_PORT="5432"
PROD_DB="pkmn_card_tracker_db"
PROD_USER="pkmn_card_tracker_db_user"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/prod_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating backup of production database using Docker..."
echo "📁 Backup will be saved to: $BACKUP_FILE"

# Check if password is provided
if [ -z "$PROD_PASSWORD" ]; then
    echo "❌ Production database password not set!"
    echo ""
    echo "Set the password using one of these methods:"
    echo "  1. Environment variable: export PROD_PASSWORD='your_password'"
    echo "  2. Run with password: PROD_PASSWORD='your_password' ./scripts/backup-prod-docker.sh"
    echo "  3. Use .env file: echo 'PROD_PASSWORD=your_password' >> .env"
    echo ""
    echo "⚠️  Never commit the password to version control!"
    exit 1
fi

# Create the backup using Docker
docker run --rm \
  -e PGPASSWORD="$PROD_PASSWORD" \
  -v "$(pwd)/$BACKUP_DIR:/backups" \
  postgres:16 \
  pg_dump -h "$PROD_HOST" -p "$PROD_PORT" -U "$PROD_USER" -d "$PROD_DB" \
  --verbose --clean --if-exists --no-owner --no-privileges \
  > "$BACKUP_FILE"

echo "✅ Backup completed successfully!"
echo "📊 Backup file: $BACKUP_FILE"
echo "📏 File size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Optional: Create a compressed version
echo "🗜️  Creating compressed backup..."
gzip -c "$BACKUP_FILE" > "${BACKUP_FILE}.gz"
echo "✅ Compressed backup: ${BACKUP_FILE}.gz"
echo "📏 Compressed size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)" 