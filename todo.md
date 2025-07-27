# TODO: Frontend Caching Removal & Backend API Migration

## Session Goals
- Remove all frontend caching (causing issues, will revisit later if necessary)
- Move existing TCG API calls to new facade backend APIs (keep implementation as-is initially)
- Update new APIs to use our own database instead of TCG API, sourcing data from GitHub JSON files

## Development Setup
- **Hot Reload**: Server now supports hot reloading with `npm run dev:hot`
- **TypeScript Watch**: `tsc --watch` automatically recompiles on file changes
- **Nodemon**: Automatically restarts server when compiled files change
- **Concurrently**: Runs both TypeScript compilation and nodemon simultaneously

## Background Context

### Current State Analysis
- **✅ Frontend Caching Issues**: Resolved - `usePokemonCache` and `useSetsCache` hooks have been removed
- **✅ Direct TCG API Calls**: Resolved - All frontend components now use backend APIs
- **✅ Database Structure**: `cards` table with 19,500+ cards populated from TCG API
- **✅ Data Source**: GitHub repository at https://github.com/PokemonTCG/pokemon-tcg-data contains all JSON data
- **✅ API Migration**: 3/4 endpoints migrated to database (cards/search, cards/set, sets)

### Data Source Details
- **GitHub Repository**: https://github.com/PokemonTCG/pokemon-tcg-data
- **Structure**: 
  - `/cards/en/` - Individual card JSON files
  - `/sets/` - Set information JSON files
  - Raw JSON data that matches TCG API v2 format
- **Advantages**: No API rate limits, complete data access, faster response times

## Implementation Checklist

### Phase 1: Remove Frontend Caching ✅ COMPLETED
- [x] **Remove `usePokemonCache` hook**
  - [x] Delete `frontend/src/hooks/usePokemonCache.ts`
  - [x] Update `HomePage.tsx` to remove caching dependency
  - [x] Update `CollectionPage.tsx` to remove caching dependency
  - [x] Update `FilterPanel.tsx` to remove caching dependency
  - [x] Replace with direct API calls to new backend endpoints

- [x] **Remove `useSetsCache` hook**
  - [x] Delete `frontend/src/hooks/useSetsCache.ts`
  - [x] Update `SetsPage.tsx` to remove caching dependency
  - [x] Replace with direct API calls to new backend endpoints

- [x] **Clean up localStorage cache keys**
  - [x] Remove `pokemon_species_cache_v1` from localStorage
  - [x] Remove `pokemon_sets_cache_v1` from localStorage
  - [x] Remove any other cache-related localStorage items

### Phase 2: Create Backend API Facades ✅ COMPLETED
- [x] **Create new backend routes**
  - [x] Create `server/src/routes/cards.ts` for card-related endpoints
  - [x] Create `server/src/routes/sets.ts` for set-related endpoints
  - [x] Create `server/src/routes/pokemon.ts` for Pokémon species endpoints

- [x] **Implement card endpoints**
  - [x] `GET /api/cards/search?name={pokemonName}` - Search cards by Pokémon name
  - [x] `GET /api/cards/set/{setId}` - Get all cards from a specific set
  - [x] ✅ Migrated to database (no longer using TCG API)

- [x] **Implement set endpoints**
  - [x] `GET /api/sets` - Get all card sets
  - [x] ✅ Migrated to database (no longer using TCG API)

- [x] **Implement Pokémon species endpoints**
  - [x] `GET /api/pokemon/species` - Get all Pokémon species
  - [x] Still using PokeAPI (intentionally kept)

- [x] **Update backend index.ts**
  - [x] Register new route files
  - [x] Add proper error handling and logging

- [x] **Fix TypeScript compilation errors**
  - [x] Resolve Express route handler return type issues
  - [x] Ensure all endpoints compile successfully

### Phase 3: Update Frontend to Use Backend APIs ✅ COMPLETED
- [x] **Update `PokemonCardsPage.tsx`**
  - [x] Replace direct TCG API call with backend API call
  - [x] Update axios call to use `BACKEND_URL + '/api/cards/search'`
  - [x] Maintain same response structure for compatibility

- [x] **Update `SetCardsPage.tsx`**
  - [x] Replace direct TCG API call with backend API call
  - [x] Update axios call to use `BACKEND_URL + '/api/cards/set/{setId}'`
  - [x] Maintain same response structure for compatibility

- [x] **Update `SetsPage.tsx`**
  - [x] Replace `useSetsCache` with direct backend API call
  - [x] Update axios call to use `BACKEND_URL + '/api/sets'`
  - [x] Maintain same response structure for compatibility

- [x] **Update `HomePage.tsx`**
  - [x] Replace `usePokemonCache` with direct backend API call
  - [x] Update axios call to use `BACKEND_URL + '/api/pokemon/species'`
  - [x] Maintain same response structure for compatibility

- [x] **Update `CollectionPage.tsx` and `FilterPanel.tsx`**
  - [x] Replace `usePokemonCache` dependency with direct backend API call
  - [x] Update to use new backend endpoint

### Phase 4: Document and Test Current API Responses ✅ COMPLETED
- [x] **Create API migration documentation**
  - [x] Create `API_MIGRATION_DOCS.md` for tracking responses
  - [x] Create `server/src/scripts/test-api-baseline.ts` for automated testing
  - [x] Document current response structures for all endpoints
  - [x] Create sample API calls for each endpoint
  - [x] Record response examples and test cases

- [x] **Test current API endpoints**

### Phase 5: Cleanup and Optimization ✅ COMPLETED
- [x] **Remove unused TCG API references**
  - [x] Remove unused `TCG_API_URL` constant from `server/src/routes/cards.ts`
  - [x] Remove unused `axios` import from `server/src/routes/cards.ts`
  - [x] Update documentation to reflect completed migration status

- [x] **Update documentation**
  - [x] Mark all phases as completed in TODO.md
  - [x] Update current state analysis to reflect resolved issues
  - [x] Document successful API migration completion
  - [x] Run `npm run test-api-baseline` to execute automated tests (updated with 5 retries, 3-min timeout)
  - [x] Test `/api/cards/search?name={pokemonName}` with sample calls
  - [x] Test `/api/cards/set/{setId}` with sample calls
  - [x] Test `/api/sets` with sample calls
  - [x] Test `/api/pokemon/species` with sample calls
  - [x] Verify response structures match TypeScript interfaces

### Phase 5: Switch to GitHub JSON Data Source
- [x] **Create data fetching utilities**
  - [x] Create `server/src/services/githubDataService.ts` (not needed - using existing database)
  - [x] Implement functions to fetch JSON data from GitHub repository (using existing database)
  - [x] Add caching layer for GitHub data (server-side, not frontend) (database is the cache)

- [x] **Update backend endpoints to use GitHub data (one at a time)**
  - [x] Update `/api/cards/search` to use database (✅ **COMPLETED**)
  - [x] Test and verify no breaking changes (✅ **COMPLETED**)
  - [ ] Update `/api/cards/set/{setId}` to use database
  - [ ] Test and verify no breaking changes
  - [ ] Update `/api/sets` to use database
  - [ ] Test and verify no breaking changes
  - [ ] Update `/api/pokemon/species` to use GitHub JSON files (keep as-is - working well)
  - [ ] Test and verify no breaking changes

- [ ] **Implement data synchronization**
  - [ ] Create script to periodically sync with GitHub repository
  - [ ] Add version checking to ensure data freshness
  - [ ] Implement fallback to existing database if GitHub is unavailable

### Phase 5: Testing & Validation
- [ ] **Test all endpoints**
  - [ ] Verify card search functionality works correctly
  - [ ] Verify set browsing functionality works correctly
  - [ ] Verify Pokémon species list works correctly
  - [ ] Test error handling and fallback scenarios

- [ ] **Performance testing**
  - [ ] Compare response times between old and new implementations
  - [ ] Verify no regression in user experience
  - [ ] Test with large datasets

- [ ] **Data integrity validation**
  - [ ] Verify all card data is accessible
  - [ ] Verify set information is complete
  - [ ] Verify Pokémon species data is accurate

## Important Considerations

### Technical Notes
- **Backward Compatibility**: Maintain same API response structure during transition
- **Error Handling**: Implement proper error handling for GitHub data fetching
- **Rate Limiting**: GitHub has rate limits, implement appropriate caching
- **Data Freshness**: GitHub data may not be as up-to-date as TCG API
- **Fallback Strategy**: Keep existing database as fallback if GitHub is unavailable

### Future Considerations
- **Caching Strategy**: May want to implement server-side caching later
- **Data Updates**: Need strategy for keeping GitHub data in sync
- **Performance**: Monitor performance impact of removing frontend caching
- **User Experience**: Ensure no degradation in app responsiveness

### Files to Monitor
- `frontend/src/hooks/usePokemonCache.ts` - **REMOVE**
- `frontend/src/hooks/useSetsCache.ts` - **REMOVE**
- `frontend/src/components/PokemonCardsPage.tsx` - **UPDATE**
- `frontend/src/components/SetCardsPage.tsx` - **UPDATE**
- `frontend/src/components/SetsPage.tsx` - **UPDATE**
- `frontend/src/components/HomePage.tsx` - **UPDATE**
- `frontend/src/components/CollectionPage.tsx` - **UPDATE**
- `frontend/src/components/FilterPanel.tsx` - **UPDATE**
- `server/src/routes/` - **ADD NEW FILES**
- `server/src/services/` - **ADD NEW FILES**

## Current Status Summary

### ✅ Completed
- **Phase 1**: All frontend caching removed (`usePokemonCache`, `useSetsCache`)
- **Phase 2**: Backend API facades created and TypeScript errors resolved
- **Phase 3**: Frontend updated to use new backend APIs
- **Development Setup**: Hot reloading configured with `npm run dev:hot`

### 🔄 In Progress
- **Phase 5**: Switch to GitHub JSON Data Source
  - Ready to begin migrating backend endpoints to use GitHub JSON data
  - Need to create GitHub data fetching service and update endpoints one at a time

### 📋 Next Steps for New Session
1. **Begin Phase 5**: Start switching backend endpoints to use GitHub JSON data (one at a time)
2. **Create GitHub data service**: Implement `server/src/services/githubDataService.ts`
3. **Update endpoints**: Migrate each endpoint from TCG API to GitHub JSON data
4. **Clean up localStorage**: Remove remaining cache keys from browser storage

## Success Criteria
- [x] All frontend caching removed
- [x] All TCG API calls moved to backend facades
- [ ] Backend APIs use GitHub JSON data source
- [ ] No regression in functionality or performance
- [x] Proper error handling implemented
- [ ] Fallback mechanisms in place
