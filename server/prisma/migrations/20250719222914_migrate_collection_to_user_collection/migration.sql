-- Migration: Move collection data to user_collection and update card_tags references
-- This migration handles the logical error where users can't tag cards they don't own

-- Step 1: Migrate existing collection data to user_collection table
-- Only migrate records where the card exists in the cards table
INSERT INTO "user_collection" ("userid", "cardid", "quantity", "added_at")
SELECT 
    c."userid",
    c."id" as "cardid",
    1 as "quantity", -- Default quantity to 1
    COALESCE(c."created_at", NOW()) as "added_at"
FROM "collection" c
INNER JOIN "cards" cards ON c."id" = cards."id"
WHERE NOT EXISTS (
    SELECT 1 FROM "user_collection" uc 
    WHERE uc."userid" = c."userid" 
    AND uc."cardid" = c."id"
);

-- Step 2: Update existing card_tags to reference cards table instead of collection
-- First, create a temporary mapping of collection records to their card IDs
CREATE TEMP TABLE temp_collection_mapping AS
SELECT 
    c."id" as "collection_id",
    c."userid",
    c."id" as "card_id"
FROM "collection" c
INNER JOIN "cards" cards ON c."id" = cards."id";

-- Update card_tags to use the card_id from the mapping
UPDATE "card_tags" ct
SET "card_id" = tcm."card_id"
FROM temp_collection_mapping tcm
WHERE ct."card_id" = tcm."collection_id"
AND ct."userid" = tcm."userid";

-- Clean up temporary table
DROP TABLE temp_collection_mapping;

-- Step 3: Add any missing default tags for users
INSERT INTO "tags" ("name", "userid", "color", "created_at")
SELECT 
    'favorite' as "name",
    u."id" as "userid",
    '#FFD700' as "color", -- Gold color
    NOW() as "created_at"
FROM "users" u
WHERE NOT EXISTS (
    SELECT 1 FROM "tags" t 
    WHERE t."name" = 'favorite' 
    AND t."userid" = u."id"
);

INSERT INTO "tags" ("name", "userid", "color", "created_at")
SELECT 
    'wishlist' as "name",
    u."id" as "userid",
    '#FF69B4' as "color", -- Hot pink color
    NOW() as "created_at"
FROM "users" u
WHERE NOT EXISTS (
    SELECT 1 FROM "tags" t 
    WHERE t."name" = 'wishlist' 
    AND t."userid" = u."id"
);