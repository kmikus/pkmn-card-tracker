#!/bin/bash

# Switch to Production Database
echo "🔄 Switching to production database..."

# Check if production password is provided
if [ -z "$PROD_PASSWORD" ]; then
    echo "❌ Production database password not set!"
    echo ""
    echo "Set the password using one of these methods:"
    echo "  1. Environment variable: export PROD_PASSWORD='your_password'"
    echo "  2. Run with password: PROD_PASSWORD='your_password' ./scripts/use-prod-db.sh"
    echo "  3. Use .env file: echo 'PROD_PASSWORD=your_password' >> .env"
    echo ""
    echo "⚠️  Never commit the password to version control!"
    exit 1
fi

# Create production .env with actual password
cat .env.production | sed "s/<PASSWORD>/$PROD_PASSWORD/g" > .env

echo "✅ Now using production database"
echo "📍 Database: dpg-d1k1d7a4d50c738mvsu0-a.oregon-postgres.render.com/pkmn_card_tracker_db"
echo ""
echo "💡 Next steps:"
echo "  1. Run: npx prisma generate"
echo "  2. Start your server: npm run dev"
echo ""
echo "⚠️  Be careful - you're now connected to production!" 