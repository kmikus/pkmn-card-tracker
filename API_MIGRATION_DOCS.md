# API Migration Documentation

## Overview
This document tracks the migration from external APIs (TCG API, PokeAPI) to our own database using GitHub JSON data. Each endpoint will be updated one at a time with thorough testing to ensure no breaking changes.

## Migration Strategy
1. **Document current API responses** - Capture exact response structure from external APIs
2. **Update one endpoint at a time** - Modify backend to use database instead of external API
3. **Test thoroughly** - Ensure response structure remains identical
4. **Verify frontend compatibility** - Confirm no TypeScript or runtime errors

## Endpoints to Migrate

### 1. `/api/cards/search?name={pokemonName}`
**Current Source**: TCG API (`https://api.pokemontcg.io/v2/cards?q=name:{name}`)
**Target Source**: Database (GitHub JSON data)

#### Sample API Calls to Document:
- [ ] `GET /api/cards/search?name=pikachu` (base case - common Pokémon)
- [ ] `GET /api/cards/search?name=charizard` (base case - popular Pokémon)
- [ ] `GET /api/cards/search?name=ivysaur` (edge case - contains 'dark' in some card names)
- [ ] `GET /api/cards/search?name=nidoran` (edge case - gender-specific species)
- [ ] `GET /api/cards/search?name=iron%20hands` (edge case - space in name)
- [ ] `GET /api/cards/search?name=ninetales` (edge case - regional variants)
- [ ] `GET /api/cards/search?name=toxtricity` (edge case - form differences)

#### Response Structure to Maintain:
```typescript
interface TCGResponse<TCGCard> {
  data: TCGCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}
```

#### Test Results:
| Test Case | Status | Response Time | Card Count | Notes |
|-----------|--------|---------------|------------|-------|
| Pikachu search | ✅ Success | 124,452ms | 173 cards | Base case - common Pokémon |
| Charizard search | ✅ Success | 51,030ms | 102 cards | Base case - popular Pokémon |
| Ivysaur search | ✅ Success | 90,283ms | 19 cards | Edge case - contains 'dark' in some card names |
| Nidoran search | ✅ Success | 43,666ms | 32 cards | Edge case - gender-specific species |
| Iron Hands search | ❌ Failed | 133,969ms | N/A | Edge case - space in name (500 error) |
| Ninetales search | ✅ Success | 27,668ms | 53 cards | Edge case - regional variants |
| Toxtricity search | ✅ Success | 24,189ms | 19 cards | Edge case - form differences |

---

### 2. `/api/cards/set/{setId}`
**Current Source**: TCG API (`https://api.pokemontcg.io/v2/cards?q=set.id:{setId}`)
**Target Source**: Database (GitHub JSON data)

#### Sample API Calls to Document:
- [ ] `GET /api/cards/set/base1` (Base Set - classic set)
- [ ] `GET /api/cards/set/base2` (Jungle - classic set)
- [ ] `GET /api/cards/set/base3` (Fossil - classic set)
- [ ] `GET /api/cards/set/swsh1` (Sword & Shield - modern set)
- [ ] `GET /api/cards/set/sv1` (Scarlet & Violet - latest set)
- [ ] `GET /api/cards/set/g1` (Gym Heroes - special set)
- [ ] `GET /api/cards/set/ex1` (Ruby & Sapphire - EX era)
- [ ] `GET /api/cards/set/xy1` (XY - XY era)
- [ ] `GET /api/cards/set/sm1` (Sun & Moon - SM era)
- [ ] `GET /api/cards/set/celebrations` (Celebrations - special set)

#### Response Structure to Maintain:
```typescript
interface TCGResponse<TCGCard> {
  data: TCGCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}
```

#### Test Results:
| Test Case | Status | Response Time | Card Count | Notes |
|-----------|--------|---------------|------------|-------|
| Base Set (base1) | ✅ Success | 57,646ms | 102 cards | Classic set |
| Jungle (base2) | ✅ Success | 42,546ms | 64 cards | Classic set |
| Fossil (base3) | ✅ Success | 14,293ms | 62 cards | Classic set |
| Sword & Shield (swsh1) | ✅ Success | 11,574ms | 216 cards | Modern set |
| Scarlet & Violet (sv1) | ✅ Success | 28,906ms | 250 cards | Latest set |
| Gym Heroes (g1) | ✅ Success | 145,432ms | 117 cards | Special set |
| Ruby & Sapphire (ex1) | ✅ Success | 30,105ms | 109 cards | EX era |
| XY (xy1) | ✅ Success | 37,177ms | 146 cards | XY era |
| Sun & Moon (sm1) | ✅ Success | 36,831ms | 173 cards | SM era |
| Celebrations (celebrations) | ✅ Success | 51,824ms | 0 cards | Special set (no cards returned) |

---

### 3. `/api/sets`
**Current Source**: TCG API (`https://api.pokemontcg.io/v2/sets`)
**Target Source**: Database (GitHub JSON data)

#### Sample API Calls to Document:
- [ ] `GET /api/sets` (all sets)
- [ ] `GET /api/sets?page=1&pageSize=10` (pagination - first page)
- [ ] `GET /api/sets?page=2&pageSize=20` (pagination - second page)
- [ ] `GET /api/sets?page=1&pageSize=1` (pagination - single item)
- [ ] `GET /api/sets?page=999&pageSize=10` (pagination - out of bounds)
- [ ] `GET /api/sets?pageSize=250` (pagination - large page size)

#### Response Structure to Maintain:
```typescript
interface TCGResponse<TCGSet> {
  data: TCGSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}
```

#### Test Results:
| Test Case | Status | Response Time | Card Count | Notes |
|-----------|--------|---------------|------------|-------|
| All sets | ✅ Success | 111,850ms | 168 sets | Complete set list |
| Page 1, 10 items | ✅ Success | 39,301ms | 10 sets | Pagination - first page |
| Page 2, 20 items | ✅ Success | 12,966ms | 20 sets | Pagination - second page |
| Page 1, 1 item | ✅ Success | 22,959ms | 1 set | Pagination - single item |
| Page 999, 10 items | ✅ Success | 16,512ms | 0 sets | Pagination - out of bounds |
| Page 1, 250 items | ✅ Success | 27,986ms | 168 sets | Pagination - large page size |

---

### 4. `/api/pokemon/species`
**Current Source**: PokeAPI (`https://pokeapi.co/api/v2/pokemon-species?limit=1008`)
**Target Source**: Database (GitHub JSON data)

#### Sample API Calls to Document:
- [ ] `GET /api/pokemon/species?limit=1008` (all species)
- [ ] `GET /api/pokemon/species?limit=50` (limited)
- [ ] `GET /api/pokemon/species?limit=10&offset=0` (pagination - first page)
- [ ] `GET /api/pokemon/species?limit=10&offset=100` (pagination - middle page)
- [ ] `GET /api/pokemon/species?limit=1&offset=0` (pagination - single item)
- [ ] `GET /api/pokemon/species?limit=10&offset=9999` (pagination - out of bounds)
- [ ] `GET /api/pokemon/species?limit=0` (edge case - zero limit)
- [ ] `GET /api/pokemon/species` (edge case - no parameters)

#### Response Structure to Maintain:
```typescript
interface PokeAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeAPISpecies[];
}
```

#### Test Results:
| Test Case | Status | Response Time | Card Count | Notes |
|-----------|--------|---------------|------------|-------|
| All species (1008) | ✅ Success | 69ms | 1008 species | Complete species list |
| Limited (50) | ✅ Success | 190ms | 50 species | Limited species list |
| Pagination (10, offset 0) | ✅ Success | 203ms | 10 species | Pagination - first page |
| Pagination (10, offset 100) | ✅ Success | 348ms | 10 species | Pagination - middle page |
| Pagination (1, offset 0) | ✅ Success | 316ms | 1 species | Pagination - single item |
| Pagination (10, offset 9999) | ✅ Success | 167ms | 0 species | Pagination - out of bounds |
| Zero limit | ✅ Success | 327ms | 20 species | Edge case - zero limit |
| No parameters | ✅ Success | 26ms | 1008 species | Edge case - no parameters |

---

## Migration Checklist

### For Each Endpoint:
- [ ] **Document current response structure**
- [ ] **Create sample API calls**
- [ ] **Record response examples**
- [ ] **Update backend to use database**
- [ ] **Test with same API calls**
- [ ] **Compare response structures**
- [ ] **Verify frontend compatibility**
- [ ] **Update documentation**

### Database Integration Steps:
- [ ] **Create GitHub data fetching service**
- [ ] **Implement data caching layer**
- [ ] **Add error handling and fallbacks**
- [ ] **Test data freshness and updates**

## Notes
- All response structures must remain identical to prevent frontend breaking changes
- TypeScript interfaces must match exactly
- Error responses should maintain the same format
- Pagination should work identically
- Performance should be comparable or better

## GitHub Data Source
- **Repository**: https://github.com/PokemonTCG/pokemon-tcg-data
- **Card Data**: `/cards/en/` directory
- **Set Data**: `/sets/` directory
- **Update Strategy**: Periodic sync with GitHub repository 