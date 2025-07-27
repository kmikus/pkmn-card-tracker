# API Baseline Test Results

**Test Date:** 7/26/2025, 5:44:18 PM

## Summary

- **Total Tests:** 31
- **Successful:** 30
- **Failed:** 1
- **Average Response Time:** 35028ms

## Results by Endpoint

### /api/cards/search

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/search?name=pikachu | ✅ | 124452ms | 173 | 173 |  |
| /api/cards/search?name=charizard | ✅ | 51030ms | 102 | 102 |  |
| /api/cards/search?name=ivysaur | ✅ | 90283ms | 19 | 19 |  |
| /api/cards/search?name=nidoran | ✅ | 43666ms | 32 | 32 |  |
| /api/cards/search?name=iron%20hands | ❌ | 133969ms | N/A | N/A | Request failed with status code 500 |
| /api/cards/search?name=ninetales | ✅ | 27668ms | 53 | 53 |  |
| /api/cards/search?name=toxtricity | ✅ | 24189ms | 19 | 19 |  |

### /api/cards/set/base1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/base1 | ✅ | 57646ms | 102 | 102 |  |

### /api/cards/set/base2

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/base2 | ✅ | 42546ms | 64 | 64 |  |

### /api/cards/set/base3

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/base3 | ✅ | 14293ms | 62 | 62 |  |

### /api/cards/set/swsh1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/swsh1 | ✅ | 11574ms | 216 | 216 |  |

### /api/cards/set/sv1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/sv1 | ✅ | 28906ms | 250 | 258 |  |

### /api/cards/set/g1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/g1 | ✅ | 145432ms | 117 | 117 |  |

### /api/cards/set/ex1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/ex1 | ✅ | 30105ms | 109 | 109 |  |

### /api/cards/set/xy1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/xy1 | ✅ | 37177ms | 146 | 146 |  |

### /api/cards/set/sm1

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/sm1 | ✅ | 36831ms | 173 | 173 |  |

### /api/cards/set/celebrations

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/cards/set/celebrations | ✅ | 51824ms | N/A | N/A |  |

### /api/sets

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/sets | ✅ | 111850ms | 168 | 168 |  |
| /api/sets?page=1&pageSize=10 | ✅ | 39301ms | 10 | 168 |  |
| /api/sets?page=2&pageSize=20 | ✅ | 12966ms | 20 | 168 |  |
| /api/sets?page=1&pageSize=1 | ✅ | 22959ms | 1 | 168 |  |
| /api/sets?page=999&pageSize=10 | ✅ | 16512ms | N/A | 168 |  |
| /api/sets?pageSize=250 | ✅ | 27986ms | 168 | 168 |  |

### /api/pokemon/species

| Test Case | Status | Response Time | Card Count | Total Count | Notes |
|-----------|--------|---------------|------------|-------------|-------|
| /api/pokemon/species?limit=1008 | ✅ | 69ms | 1008 | 1025 |  |
| /api/pokemon/species?limit=50 | ✅ | 190ms | 50 | 1025 |  |
| /api/pokemon/species?limit=10&offset=0 | ✅ | 203ms | 10 | 1025 |  |
| /api/pokemon/species?limit=10&offset=100 | ✅ | 348ms | 10 | 1025 |  |
| /api/pokemon/species?limit=1&offset=0 | ✅ | 316ms | 1 | 1025 |  |
| /api/pokemon/species?limit=10&offset=9999 | ✅ | 167ms | N/A | 1025 |  |
| /api/pokemon/species?limit=0 | ✅ | 327ms | 20 | 1025 |  |
| /api/pokemon/species | ✅ | 26ms | 1008 | 1025 |  |

