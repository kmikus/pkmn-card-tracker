#!/bin/bash

# Switch to Development Database
echo "🔄 Switching to development database..."

# Copy development environment to .env
cp .env.development .env

echo "✅ Now using development database"
echo "📍 Database: localhost:5432/pkmn_tracker_dev"
echo ""
echo "💡 Next steps:"
echo "  1. Run: npx prisma generate"
echo "  2. Run: npx prisma db push (if needed)"
echo "  3. Start your server: npm run dev" 