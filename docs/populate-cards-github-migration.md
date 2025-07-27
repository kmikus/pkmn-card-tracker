# Populate Cards Script - GitHub Migration

## Overview
This document tracks the migration of the `populate-cards.ts` script from using TCG API to GitHub JSON data for improved efficiency and reliability.

## Goals
- [ ] Update `populate-cards.ts` to fetch from GitHub repository instead of TCG API
- [ ] Implement efficient data fetching (batch processing, error handling)
- [ ] Add data validation and integrity checks
- [ ] Test with current GitHub data structure
- [ ] Schedule automated data synchronization (every 24 hours)

## Current Status
- **Script Location**: `server/src/scripts/recurring/populate-cards.ts`
- **Current Data Source**: TCG API
- **Target Data Source**: GitHub repository (https://github.com/PokemonTCG/pokemon-tcg-data)
- **GitHub Data Path**: `/cards/en/` - Individual card JSON files

## Database Analysis

### Card Count
**Total Cards in Database**: 19,500

### Sample Cards for Validation
The following 20 random cards were selected for validation testing:

| Card ID | Name | Set | Card Number | Type | Created |
|---------|------|-----|-------------|------|---------|
| `dp6-56` | Grumpig | Legends Awakened | 56 | Psychic Pokémon | 2025-07-20 |
| `pl2-59` | Eevee | Rising Rivals | 59 | Colorless Pokémon | 2025-07-20 |
| `xy7-59` | Sliggoo | Ancient Origins | 59 | Dragon Pokémon | 2025-07-20 |
| `bw3-2` | Swadloon | Noble Victories | 2 | Grass Pokémon | 2025-07-20 |
| `xy7-73` | Faded Town | Ancient Origins | 73 | Trainer (Stadium) | 2025-07-20 |
| `sv3-147` | Excadrill | Obsidian Flames | 147 | Metal Pokémon | 2025-07-20 |
| `neo4-64` | Exeggcute | Neo Destiny | 64 | Psychic Pokémon | 2025-07-20 |
| `dp3-19` | Suicune | Secret Wonders | 19 | Water Pokémon | 2025-07-20 |
| `base5-63` | Oddish | Team Rocket | 63 | Grass Pokémon | 2025-07-20 |
| `sm35-51` | Scrafty | Shining Legends | 51 | Darkness Pokémon | 2025-07-20 |
| `sv8pt5-126` | Rescue Board | Prismatic Evolutions | 126 | Trainer (Tool) | 2025-07-20 |
| `xy10-24` | Rotom | Fates Collide | 24 | Lightning Pokémon | 2025-07-20 |
| `xyp-XY147` | Hoopa | XY Black Star Promos | XY147 | Psychic Pokémon | 2025-07-20 |
| `sm12-130` | Alolan Grimer | Cosmic Eclipse | 130 | Darkness Pokémon | 2025-07-20 |
| `swsh10-202` | Gardenia's Vigor | Astral Radiance | 202 | Trainer (Supporter) | 2025-07-20 |
| `sm11-100` | Cosmog | Unified Minds | 100 | Psychic Pokémon | 2025-07-20 |
| `base5-14` | Dark Weezing | Team Rocket | 14 | Grass Pokémon | 2025-07-20 |
| `ecard1-93` | Abra | Expedition Base Set | 93 | Psychic Pokémon | 2025-07-20 |
| `sv6pt5-7` | Houndour | Shrouded Fable | 7 | Fire Pokémon | 2025-07-20 |
| `base3-54` | Shellder | Fossil | 54 | Water Pokémon | 2025-07-20 |

**Notes on Sample Selection:**
- Mix of Pokémon and Trainer cards
- Various card types (Basic, Stage 1, Stadium, Tool, Supporter)
- Different eras (Base Set, Neo, Diamond & Pearl, Black & White, XY, Sun & Moon, Sword & Shield, Scarlet & Violet)
- Mix of numeric and alphanumeric card numbers (e.g., "XY147")
- Different rarities and energy types

## GitHub Data Structure Analysis
*To be populated*

## Implementation Plan
1. **Analyze current database structure** ✅
2. **Fetch and analyze GitHub data structure**
3. **Update script to use GitHub data**
4. **Implement data validation**
5. **Test with sample data**
6. **Schedule automation**

## Validation Queries
*To be populated*

## Notes
- GitHub repository: https://github.com/PokemonTCG/pokemon-tcg-data
- Raw JSON data matches TCG API v2 format
- No API rate limits with GitHub data
- Need to handle potential GitHub API rate limits for fetching 