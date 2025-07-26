# Sets Migration Deployment Guide

## Overview
This guide explains how to deploy the sets migration and populate the sets table in production.

## Database Connection

### How the Script Connects to Database
The `populate-sets.ts` script connects to the database using Prisma Client, which reads the `DATABASE_URL` environment variable from your `.env` file.

```typescript
import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();
```

### Environment Variables Required
The script requires the following environment variable:
- `DATABASE_URL`: PostgreSQL connection string

**Development example:**
```
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/pkmn_tracker_dev
```

**Production example:**
```
DATABASE_URL=postgresql://pkmn_card_tracker_db_user:<PASSWORD>@dpg-d1k1d7a4d50c738mvsu0-a.oregon-postgres.render.com/pkmn_card_tracker_db
```

## Production Deployment Steps

### 1. Run Database Migration
First, apply the database migrations to create and configure the sets table:

```bash
# In production environment
npx prisma migrate deploy
```

**Note**: This will apply all pending migrations, including the sets table migrations.

This will run the migrations that create and configure the sets table:
- `20250726161737_add_sets_table` - Creates the initial sets table
- `20250726225159_add_sets_table` - Refines the table structure (adds logo, symbol, created_at columns)

### 2. Generate Prisma Client
Ensure the Prisma client is generated for your production environment:

```bash
npx prisma generate
```

### 3. Populate Sets Data
Run the populate script to import all 168 sets from GitHub:

```bash
# Using ts-node (if TypeScript is available)
npx ts-node src/scripts/populate-sets.ts

# Or compile and run (recommended for production)
npx tsc src/scripts/populate-sets.ts
node dist/scripts/populate-sets.js
```

### 4. Verify the Import
Check that the sets were imported correctly:

```bash
# Connect to your database and run:
SELECT COUNT(*) FROM sets;
# Should return: 168

# Check newest sets:
SELECT id, name, "releaseDate" FROM sets ORDER BY "releaseDate" DESC LIMIT 5;
```

## Script Details

### What the Script Does
1. **Fetches data** from [GitHub repository](https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/refs/heads/master/sets/en.json)
2. **Clears existing data** (if any) from the sets table
3. **Inserts all 168 sets** with complete metadata
4. **Verifies the import** and shows sample data

### Expected Output
```
Fetching sets data from GitHub...
Found 168 sets to import
Clearing existing sets data...
Inserting sets into database...
✅ Successfully imported 168 sets
📊 Total sets in database: 168

📋 Sample sets (newest first):
  - Black Bolt (zsv10pt5): 2025/07/18 - 172 cards
  - White Flare (rsv10pt5): 2025/07/18 - 173 cards
  - Destined Rivals (sv10): 2025/05/30 - 244 cards
  - Journey Together (sv9): 2025/03/28 - 190 cards
  - Prismatic Evolutions (sv8pt5): 2025/01/17 - 180 cards
✅ Sets population completed successfully
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` is set correctly
   - Check database is accessible from your environment
   - Ensure database user has proper permissions

2. **Migration Not Applied**
   - Run `npx prisma migrate status` to check migration status
   - Run `npx prisma migrate deploy` to apply pending migrations

3. **Prisma Client Not Generated**
   - Run `npx prisma generate` to regenerate the client
   - Ensure you're using the correct Prisma client path

4. **GitHub API Rate Limits**
   - The script fetches from a public JSON file, so rate limits are unlikely
   - If issues occur, the JSON can be downloaded manually and imported

### Verification Commands

```bash
# Check migration status
npx prisma migrate status

# Check database connection
npx prisma db pull

# Verify sets table exists
npx prisma studio  # Opens Prisma Studio to inspect data

# Check sets count
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM sets;"

# Verify sets table structure
npx prisma db execute --stdin <<< "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sets' ORDER BY ordinal_position;"
```

### Migration Status
After running `npx prisma migrate status`, you should see:
- **6 migrations found** in prisma/migrations
- **Database schema is up to date!**
- All migrations applied successfully

## Data Source
The sets data comes from the official Pokémon TCG data repository:
- **URL**: https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/refs/heads/master/sets/en.json
- **Format**: JSON array of set objects
- **Update Frequency**: Updated regularly by the Pokémon TCG team
- **License**: Open source, maintained by Pokémon

## Future Updates
To update the sets data in the future:
1. Run the populate script again (it clears existing data first)
2. Or create a more sophisticated update script that only adds new sets
3. Consider setting up automated updates from the GitHub repository 