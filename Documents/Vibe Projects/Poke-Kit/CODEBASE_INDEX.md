# Pokémon Tool Kit - Codebase Index

**Last Updated:** 2025-11-15
**Project Status:** Active Development - Phase 3 (Team Builder & Pokédex) - Pokédex COMPLETED

---

## Project Structure Overview

```
Poke-Kit/
├── CLAUDE.md                    # Main project documentation and context
├── SESSION_PROTOCOLS.md         # Development session protocols
├── README.md                    # User-facing project readme
├── plan/                        # Project planning and phase tracking
│   ├── outline.md              # Phase status tracking
│   ├── phase1.md               # Web App Foundation
│   ├── phase2.md               # Type Calculator (planned)
│   ├── phase3.md               # Trading Hub (planned)
│   ├── phase4.md               # Team Builder & PWA (planned)
│   ├── phase5.md               # Android App Setup (planned)
│   └── phase6.md               # Android Features (planned)
├── handoff/                     # Session handoff documents
│   └── MASTER_HANDOFF_INDEX.md # Catalog of all handoffs
├── docs/                        # Shared documentation
├── web-app/                     # Progressive Web App (Vite + TS + Tailwind)
└── android-app/                 # Native Android App (Kotlin + Jetpack Compose)
```

---

## Web App (`/web-app/`)

### Core Files
- **`index.html`** - Entry HTML with Phosphor Icons CDN
- **`package.json`** - Dependencies: vite, typescript, tailwindcss, @phosphor-icons/web, localforage
- **`vite.config.ts`** - Vite configuration
- **`tailwind.config.js`** - Tailwind with Pokémon color palette and type colors
- **`postcss.config.js`** - PostCSS with Tailwind + Autoprefixer
- **`tsconfig.json`** - TypeScript configuration (strict mode)

### Source Code (`/web-app/src/`)

#### Main Application
- **`main.ts`** - App entry point, navigation logic, app shell HTML, calculator and Pokédex initialization
- **`style.css`** - Global Tailwind imports and custom component classes
- **`calculator.ts`** - Type Calculator UI logic, event handlers, results display
- **`pokedex.ts`** - Pokédex browser with search, filter, sort, and expandable variant cards

#### Data Layer (`/web-app/src/data/`)
- **`typeChart.ts`** - Type effectiveness data (fully converted to TypeScript with interfaces)
- **`typeCombos.ts`** - Type combination rankings (fully converted to TypeScript with interfaces)
- **`pokemon.json`** - Complete Pokémon dataset (1000+ Pokémon from pkmn.help with stats, types, names)

#### Type Definitions (`/web-app/src/types/`)
- **`pokemon.ts`** - TypeScript interfaces for Pokémon type system (PokemonType, TypeMultiplier, DefensiveProfile, PokemonCreature, PokemonGroup, PokedexState) and utility functions (getGeneration, getFormInfo, getTotalStats, etc.)

#### Components (`/web-app/src/components/`)
*Pending - Will contain reusable UI components*

#### Pages (`/web-app/src/pages/`)
*Pending - Will contain page-specific logic*

#### Utils (`/web-app/src/utils/`)
*Pending - Will contain helper functions*

### Build Output
- **`dist/`** - Production build output (gitignored)
- **`node_modules/`** - NPM dependencies (gitignored)

---

## Android App (`/android-app/`)

**Status:** Not yet created
**Planned Structure:**
- Kotlin + Jetpack Compose
- MVVM architecture
- Material 3 with Pokémon theming
- Shares TYPE_CHART data logic with web app

---

## Shared Resources (`/docs/`)

**Planned:**
- `type-chart.json` - Canonical type effectiveness data (shared by web + Android)
- `design-system.md` - Design tokens, colors, typography specs
- `api-integration.md` - PokéAPI integration guide

---

## Current Phase Status

### ✅ Phase 1 Completed (2025-11-13)
1. Project structure created
2. Vite + TypeScript + Tailwind initialized (v3.4.17 stable)
3. Tailwind configured with Pokémon colors and type colors
4. App shell with navigation built (desktop + mobile responsive)
5. Pages scaffolded (Home, Calculator, Teams, Trading)
6. Dev server running successfully (verified working)
7. Session protocols and handoff infrastructure established
8. User confirmed web app works correctly

### ✅ Phase 2 Type Calculator (2025-11-14) - COMPLETED
1. Created comprehensive TypeScript type system (`types/pokemon.ts`)
2. Converted `typeChart.ts` to TypeScript with full type safety
3. Converted `typeCombos.ts` to TypeScript with Wolfe Glick rankings
4. Built Type Calculator UI with button-based type selectors (36 color-coded buttons)
5. Implemented defensive matchup calculation logic
6. Created beautiful results display with type pills, tier rankings, and stats
7. Added Tailwind safelist for dynamic type color classes
8. Added official Pokémon type icon SVGs (18 files) with watermark overlay effect
9. User tested - works correctly with full color-coded button UI and icon enhancement

**UX Enhancements Completed:**
- Button-based selector with hover effects and selected states
- Watermark-style type icon overlay (25% opacity, positioned at right: -5%)
- Official Gen 8-9 type icons from partywhale/pokemon-type-icons (MIT license)

### ✅ Phase 3 Pokédex Browser (2025-11-15) - COMPLETED
1. Created Pokédex browser with search, type filter, and sort functionality
2. Implemented grouping algorithm to separate base Pokémon from variants
3. Built expandable variant card UI (Mega Evolutions, Regional Forms)
4. Added generation badges (Gen 1-9) based on National Pokédex ranges
5. Added form information badges with debut game details
6. Integrated with pokemon.json dataset (1000+ Pokémon)
7. Resolved browser caching issues for proper updates
8. User tested - works correctly with expandable variants

**Features Implemented:**
- Search by name or Pokédex number
- Filter by type (all 18 types)
- Sort by: Pokédex #, Name, HP, Attack, Defense, Speed, Total Stats
- Expandable cards showing Mega/Regional/Gigantamax forms
- Generation badges (Gen 1-9)
- Form badges with debut game info
- Display limit (50 Pokémon with "Load More" button)

### ⏳ Future Phases
- Phase 3 (Continued): Team Builder & PWA
- Phase 4: Android App Setup
- Phase 5: Android Features
- Phase 6: Trading Resources (informational directory)

---

## Dependencies

### Web App
**Production:**
- `@phosphor-icons/web` - Icon library
- `localforage` - IndexedDB wrapper for offline storage

**Development:**
- `vite` - Build tool
- `typescript` - Type safety
- `tailwindcss` - Utility-first CSS
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixing

---

## Key Design Decisions

### Technology Choices
1. **Vite over Create React App** - Faster dev server, simpler config
2. **Vanilla TypeScript over framework** - Matches mockup patterns, simpler for type calculator logic
3. **Tailwind CSS** - Already used in mockups, utility-first approach
4. **Phosphor Icons** - Matches mockup iconography
5. **Progressive Web App approach** - Cross-platform without app store approval

### Architecture Decisions
1. **Responsive web layout** - Not mobile mockup, full desktop + mobile experience
2. **Desktop: Top navigation** - Tab-style navigation in header
3. **Mobile: Bottom navigation** - Fixed bottom bar with icons
4. **Single-page app** - Client-side routing, no page reloads
5. **Shared data layer** - TYPE_CHART logic will be shared with Android

---

## Development Workflow

### Starting Development
```bash
cd web-app
npm install
npm run dev  # Starts dev server on http://localhost:5173
```

### Building for Production
```bash
npm run build  # Outputs to dist/
npm run preview  # Preview production build
```

### Type Checking
```bash
npm run type-check  # TypeScript compilation check
```

---

## Notes for Future Sessions

### Known Issues
- None currently

### Next Priority Tasks
1. **Phase 3 (Continued):** Team Builder implementation (select 6 Pokémon, type coverage analysis)
2. **Phase 3 (Continued):** PWA features (manifest, service worker, offline support)
3. **Enhancements:** Pokémon detail modal, Load More pagination, team save/load functionality

### Technical Debt
- None yet - project just started

---

*This index provides comprehensive navigation for the Poke-Kit codebase. Update when significant structural changes occur.*
