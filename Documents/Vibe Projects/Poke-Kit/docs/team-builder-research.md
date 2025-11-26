# Team Builder - Research & Implementation Plan

## Feature Overview

**Goal:** Build a campaign team builder that suggests optimal teams for each gym leader/boss based on Pokémon available up to that point in the game.

**Initial Scope:** Gen 1 (Red/Blue/Yellow) and Gen 3 remakes (FireRed/LeafGreen)

**User Flow:**
1. Select game (Red, Blue, Yellow, FireRed, LeafGreen)
2. Select boss (Brock, Misty, etc.)
3. See recommended team from Pokémon catchable before that fight

---

## Data Requirements

### 1. Gym Leader / Boss Data
- Boss name and location
- Their Pokémon team (species, levels, moves)
- Type weaknesses to exploit
- Game-specific variations (Yellow has different teams)

### 2. Pokémon Availability by Progression
- Which routes/areas are accessible before each gym
- What Pokémon can be caught in each area
- Encounter methods (walking, fishing, surfing, etc.)
- Version exclusives (Red vs Blue, FireRed vs LeafGreen)

### 3. Pokémon Data (Already Have)
- Types, stats, movesets
- Evolution requirements
- Type effectiveness chart

---

## Data Sources Research

### Route/Encounter Data - AVAILABLE

**PokéAPI** (https://pokeapi.co) - PRIMARY SOURCE
- Endpoint: `/api/v2/location-area/{id}`
- Provides: All Kanto location areas with version-specific encounters
- Format: JSON REST API
- Data includes:
  - Pokémon species per area
  - Encounter methods (walk, fish, surf, etc.)
  - Level ranges (min/max)
  - Encounter rates
  - Version filtering (red, blue, yellow, firered, leafgreen)
- Effort: Minimal - just query the API

**PokeDB Data Export** (https://pokedb.org/data-export/) - BACKUP
- Tables: Encounters (37,724 rows), Locations (781 rows), Location Areas (2,464 rows)
- Format: CSV or JSON download
- License: Educational/research/non-commercial
- Effort: Minimal - download and import

### Gym Leader Data - REQUIRES COMPILATION

**No API exists for trainer/gym leader data.** This has been requested but never implemented (see PokéAPI GitHub issues #432, #580).

**Option 1: Manual Compilation from Bulbapedia** (RECOMMENDED FOR POC)
- Source: https://bulbapedia.bulbagarden.net/wiki/Brock
- Data available: Complete gym leader teams with levels, moves, held items
- Effort: 4-6 hours for Gen 1 (8 gyms + Elite 4 + Champion + Rival battles)
- Pros: Human-verified, easy to understand
- Cons: Manual work, potential for typos

**Option 2: Parse FireRed Decompilation**
- Source: https://github.com/pret/pokefirered
- Files: `/src/data/trainers.h`, `/src/data/trainer_parties.h`
- Format: C header files with struct definitions
- Effort: Medium - need to parse C structs to JSON
- Pros: Authoritative game data, includes all trainers
- Cons: Only covers FireRed/LeafGreen, not original Red/Blue

**Option 3: Existing GitHub Datasets**
- https://github.com/OttoTonsorialist/pkmn_gen_four_trainer_data - Gen 4 only (not applicable)
- No existing JSON dataset found for Gen 1/3 trainer data

### Pokémon Species Data - ALREADY HAVE

We already have `pokemon.json` with 1000+ Pokémon including:
- Types, stats, abilities
- Species names in multiple languages
- Form variations

---

## Recommended Implementation Approach

### Phase 1: Data Structure & Manual Entry (This Session)
1. Design JSON schema for game/gym/availability data
2. Manually compile Gen 1 gym leader data from Bulbapedia
3. Create route-to-gym progression mapping

### Phase 2: API Integration
1. Query PokéAPI for route encounter data
2. Cache responses locally for offline use
3. Build availability filtering logic

### Phase 3: Recommendation Engine
1. Match available Pokémon types against gym weaknesses
2. Score Pokémon by effectiveness (type advantage, stats, level)
3. Build team of 6 with good type coverage

### Phase 4: UI Implementation
1. Game selector dropdown
2. Gym/boss selector (unlocks progressively)
3. Recommended team display with reasoning

---

## Data Schema Design

### games.json
```json
{
  "red": {
    "name": "Pokémon Red",
    "generation": 1,
    "region": "kanto",
    "releaseYear": 1996,
    "gyms": ["brock", "misty", "surge", "erika", "koga", "sabrina", "blaine", "giovanni"],
    "eliteFour": ["lorelei", "bruno", "agatha", "lance"],
    "champion": "blue"
  }
}
```

### gyms.json
```json
{
  "brock": {
    "name": "Brock",
    "title": "Pewter City Gym Leader",
    "specialty": "rock",
    "badge": "Boulder Badge",
    "teams": {
      "red": [
        { "pokemon": "geodude", "level": 12 },
        { "pokemon": "onix", "level": 14 }
      ],
      "yellow": [
        { "pokemon": "geodude", "level": 10 },
        { "pokemon": "onix", "level": 12 }
      ]
    },
    "weaknesses": ["water", "grass", "fighting", "ground"],
    "availableBefore": ["route-1", "route-2", "route-22", "viridian-forest"]
  }
}
```

### progression.json
```json
{
  "kanto": {
    "beforeBrock": {
      "routes": ["route-1", "route-2", "route-22", "viridian-forest"],
      "pokemon": {
        "red": ["pidgey", "rattata", "spearow", "nidoran-f", "nidoran-m", "pikachu", "caterpie", "weedle"],
        "blue": ["pidgey", "rattata", "spearow", "nidoran-f", "nidoran-m", "pikachu", "caterpie", "weedle"]
      }
    }
  }
}
```

---

## Gen 1 Kanto Gym Progression

| Gym | Leader | Type | Location | Routes Before |
|-----|--------|------|----------|---------------|
| 1 | Brock | Rock | Pewter City | Route 1, 2, 22, Viridian Forest |
| 2 | Misty | Water | Cerulean City | + Route 3, 4, Mt. Moon, Route 24, 25 |
| 3 | Lt. Surge | Electric | Vermilion City | + Route 5, 6, 11, Diglett's Cave, S.S. Anne |
| 4 | Erika | Grass | Celadon City | + Route 7, 8, 9, 10, Rock Tunnel, Pokemon Tower |
| 5 | Koga | Poison | Fuchsia City | + Route 12, 13, 14, 15, Safari Zone |
| 6 | Sabrina | Psychic | Saffron City | + Saffron City, Fighting Dojo |
| 7 | Blaine | Fire | Cinnabar Island | + Route 19, 20, 21, Seafoam Islands, Pokemon Mansion |
| 8 | Giovanni | Ground | Viridian City | + Victory Road access |

---

## Effort Estimates

| Task | Time | Notes |
|------|------|-------|
| Data schema design | 1-2 hours | JSON structure for games, gyms, progression |
| Gen 1 gym data (manual) | 3-4 hours | 8 gyms + E4 + Champion from Bulbapedia |
| Route encounter mapping | 2-3 hours | Map routes to gym progression |
| PokéAPI integration | 2-3 hours | Query and cache encounter data |
| Recommendation logic | 3-4 hours | Type matching, scoring, team building |
| UI implementation | 4-6 hours | Selectors, team display, explanations |
| **Total** | **15-22 hours** | Spread across multiple sessions |

---

## Sources & References

### APIs
- **PokéAPI**: https://pokeapi.co/docs/v2
  - Location areas: https://pokeapi.co/api/v2/location-area/
  - Pokémon encounters by version

### Databases
- **PokeDB Export**: https://pokedb.org/data-export/
- **Veekun Pokédex**: https://github.com/veekun/pokedex (CSV/SQLite)

### Game Data / Decompilations
- **pret/pokefirered**: https://github.com/pret/pokefirered
  - Trainer data in `/src/data/trainers.h`
  - Authoritative for FireRed/LeafGreen

### Wiki References (Manual Lookup)
- **Bulbapedia**: https://bulbapedia.bulbagarden.net/
  - Gym leader pages with full team data
  - Route pages with encounter tables
- **Serebii**: https://serebii.net/
  - Game-specific Pokédex and location data

### Existing Datasets (GitHub)
- **pokemon-data.json**: https://github.com/Purukitto/pokemon-data.json
- **pokemon.json**: https://github.com/fanzeyi/pokemon.json
- **Gen 4 trainer data** (reference): https://github.com/OttoTonsorialist/pkmn_gen_four_trainer_data

### PokéAPI GitHub Issues (No Trainer Data)
- Issue #432: https://github.com/PokeAPI/pokeapi/issues/432
- Issue #580: https://github.com/PokeAPI/pokeapi/issues/580

---

## Next Steps

1. ✅ Research complete - data sources identified
2. ⏳ Design final JSON schema
3. ⏳ Begin manual gym leader data compilation
4. ⏳ Build progression mapping for Gen 1
5. ⏳ Integrate PokéAPI for encounter data
6. ⏳ Implement recommendation engine
7. ⏳ Build UI

---

*Document created: 2025-11-26*
*Last updated: 2025-11-26*
