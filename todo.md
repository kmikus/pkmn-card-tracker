# Database Restructuring Plan

## Overview
Restructure the database to separate card data from user collection data, enabling users to tag (favorite/wishlist) cards they don't own yet.

## Current State
- `collection` table stores both card data AND user ownership (userid)
- `card_tags` table references `collection` table, requiring cards to exist in user's collection
- Users can only tag cards they already own

## Target State
- `cards` table stores all card data (no user-specific data)
- `user_collection` junction table links users to cards they own
- `card_tags` table references `cards` table, allowing tagging of any card
- Users can tag any card regardless of ownership

## Migration Steps

### Phase 1: Schema Design & Planning
- [ ] **Design new schema structure**
   - Create `cards` table with all card data (remove userid)
   - Create `user_collection` junction table (userid, cardid, quantity, added_at)
   - Update `card_tags` table to reference `cards` instead of `collection`
   - Keep `tags` table as-is

- [ ] **Plan data migration strategy**
   - Populate new `cards` table using TCG API utility script
   - Create `user_collection` entries from existing `collection` data
   - Migrate existing `card_tags` to reference new `cards` table

- [x] **Create TCG API utility for card population**
   - Create TypeScript utility script to call Pokemon TCG API
   - Reference existing API call pattern from PokemonCardsPage.tsx
   - Use TCG_API_URL = 'https://api.pokemontcg.io/v2/cards'
   - Create npm script to invoke the utility
   - Utility should retrieve all current card information and write to new `cards` table

### Phase 2: Database Migration
- [x] **Create new Prisma schema**
   - Add `cards` model
   - Add `user_collection` model
   - Update `card_tags` model to reference `cards`
   - Keep existing `users`, `tags` models

- [ ] **Generate and apply migration**
   - Create baseline migration for new schema
   - Ensure no data loss during migration
   - Test migration on development database

- [ ] **Populate cards table with TCG API data**
   - Run the TCG API utility script to populate `cards` table
   - Ensure all current cards are available in the database
   - Verify data quality and completeness

- [ ] **Migrate existing data**
   - Write data migration script to:
     - Create `user_collection` entries from existing `collection` data
     - Update `card_tags` references to point to new `cards` table
   - Run migration script
   - Verify data integrity

### Phase 3: Backend Code Updates
- [ ] **Update Prisma client**
   - Regenerate Prisma client with new schema
   - Update all service files to use new models

- [ ] **Update CollectionService**
   - Modify to work with `cards` and `user_collection` tables
   - Update methods for adding/removing cards from collection
   - Update methods for fetching user's collection

- [ ] **Update TagService**
   - Modify to work with `cards` table instead of `collection`
   - Update tag operations to reference `cards`
   - Ensure tag operations work for any card

- [ ] **Update API routes**
   - Modify collection routes to use new service methods
   - Update tag routes to work with new structure
   - Ensure all endpoints return correct data

### Phase 4: Frontend Updates
- [ ] **Update frontend types**
    - Modify TypeScript interfaces for new data structure
    - Update card data types to reflect new schema

- [ ] **Update API calls**
    - Modify frontend API calls to work with updated endpoints
    - Update data handling for new response formats

- [ ] **Update UI components**
    - Ensure card components work with new data structure
    - Update collection display logic
    - Verify tag functionality works for all cards

### Phase 5: Testing & Validation
- [ ] **Test data integrity**
    - Verify all existing user collections are preserved
    - Verify all existing tags are preserved
    - Test tag operations on cards not in collection

- [ ] **Test functionality**
    - Test adding/removing cards from collection
    - Test favorite/wishlist operations on any card
    - Test collection display and filtering

- [ ] **Performance testing**
    - Verify queries perform well with new structure
    - Test with larger datasets if needed

### Phase 6: Cleanup
- [ ] **Remove old schema**
    - Drop old `collection` table after confirming migration success
    - Clean up any unused code or references

- [ ] **Update documentation**
    - Update API documentation
    - Update database schema documentation

## Risk Mitigation
- **Backup strategy**: Full database backup before migration
- **Rollback plan**: Keep old schema until new one is fully tested
- **Data validation**: Comprehensive checks after each migration step
- **Gradual rollout**: Test on development, then staging, then production

## Success Criteria
- Users can favorite/wishlist any card (owned or not)
- All existing user collections are preserved
- All existing tags are preserved
- Performance is maintained or improved
- No data loss during migration 