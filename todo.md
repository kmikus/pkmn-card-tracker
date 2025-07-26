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
- **Frontend Caching Issues**: `usePokemonCache` and `useSetsCache` hooks are causing problems
- **Direct TCG API Calls**: Frontend components directly call TCG API endpoints:
  - `PokemonCardsPage.tsx`: `https://api.pokemontcg.io/v2/cards?q=name:${searchName}`
  - `SetCardsPage.tsx`: `https://api.pokemontcg.io/v2/cards?q=set.id:${set.id}`
  - `useSetsCache.ts`: `https://api.pokemontcg.io/v2/sets`
  - `usePokemonCache.ts`: `https://pokeapi.co/api/v2/pokemon-species?limit=1008`
- **Database Structure**: Already have `cards` table with 19,500+ cards populated from TCG API
- **Data Source**: GitHub repository at https://github.com/PokemonTCG/pokemon-tcg-data contains all JSON data

### Data Source Details
- **GitHub Repository**: https://github.com/PokemonTCG/pokemon-tcg-data
- **Structure**: 
  - `/cards/en/` - Individual card JSON files
  - `/sets/` - Set information JSON files
  - Raw JSON data that matches TCG API v2 format
- **Advantages**: No API rate limits, complete data access, faster response times

## Implementation Checklist

### Phase 1: Remove Frontend Caching
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

- [ ] **Clean up localStorage cache keys**
  - [ ] Remove `pokemon_species_cache_v1` from localStorage
  - [ ] Remove `pokemon_sets_cache_v1` from localStorage
  - [ ] Remove any other cache-related localStorage items

### Phase 2: Create Backend API Facades
- [ ] **Create new backend routes**
  - [ ] Create `server/src/routes/cards.ts` for card-related endpoints
  - [ ] Create `server/src/routes/sets.ts` for set-related endpoints
  - [ ] Create `server/src/routes/pokemon.ts` for Pokémon species endpoints

- [ ] **Implement card endpoints**
  - [ ] `GET /api/cards/search?name={pokemonName}` - Search cards by Pokémon name
  - [ ] `GET /api/cards/set/{setId}` - Get all cards from a specific set
  - [ ] Initially use existing TCG API calls (keep implementation as-is)

- [ ] **Implement set endpoints**
  - [ ] `GET /api/sets` - Get all card sets
  - [ ] Initially use existing TCG API calls (keep implementation as-is)

- [ ] **Implement Pokémon species endpoints**
  - [ ] `GET /api/pokemon/species` - Get all Pokémon species
  - [ ] Initially use existing PokeAPI calls (keep implementation as-is)

- [ ] **Update backend index.ts**
  - [ ] Register new route files
  - [ ] Add proper error handling and logging

### Phase 3: Update Frontend to Use Backend APIs
- [ ] **Update `PokemonCardsPage.tsx`**
  - [ ] Replace direct TCG API call with backend API call
  - [ ] Update axios call to use `BACKEND_URL + '/api/cards/search'`
  - [ ] Maintain same response structure for compatibility

- [ ] **Update `SetCardsPage.tsx`**
  - [ ] Replace direct TCG API call with backend API call
  - [ ] Update axios call to use `BACKEND_URL + '/api/cards/set/{setId}'`
  - [ ] Maintain same response structure for compatibility

- [ ] **Update `SetsPage.tsx`**
  - [ ] Replace `useSetsCache` with direct backend API call
  - [ ] Update axios call to use `BACKEND_URL + '/api/sets'`
  - [ ] Maintain same response structure for compatibility

- [ ] **Update `HomePage.tsx`**
  - [ ] Replace `usePokemonCache` with direct backend API call
  - [ ] Update axios call to use `BACKEND_URL + '/api/pokemon/species'`
  - [ ] Maintain same response structure for compatibility

- [ ] **Update `CollectionPage.tsx` and `FilterPanel.tsx`**
  - [ ] Replace `usePokemonCache` dependency with direct backend API call
  - [ ] Update to use new backend endpoint

### Phase 4: Switch to GitHub JSON Data Source
- [ ] **Create data fetching utilities**
  - [ ] Create `server/src/services/githubDataService.ts`
  - [ ] Implement functions to fetch JSON data from GitHub repository
  - [ ] Add caching layer for GitHub data (server-side, not frontend)

- [ ] **Update backend endpoints to use GitHub data**
  - [ ] Modify `/api/cards/search` to use GitHub JSON files
  - [ ] Modify `/api/cards/set/{setId}` to use GitHub JSON files
  - [ ] Modify `/api/sets` to use GitHub JSON files
  - [ ] Modify `/api/pokemon/species` to use GitHub JSON files

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

## Success Criteria
- [ ] All frontend caching removed
- [ ] All TCG API calls moved to backend facades
- [ ] Backend APIs use GitHub JSON data source
- [ ] No regression in functionality or performance
- [ ] Proper error handling implemented
- [ ] Fallback mechanisms in place
