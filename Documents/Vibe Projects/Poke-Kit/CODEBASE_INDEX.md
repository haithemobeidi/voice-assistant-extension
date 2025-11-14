# Pokémon Tool Kit - Codebase Index

**Last Updated:** 2025-11-13
**Project Status:** Active Development - Phase 1 (Web App Foundation)

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
- **`main.ts`** - App entry point, navigation logic, app shell HTML
- **`style.css`** - Global Tailwind imports and custom component classes

#### Data Layer (`/web-app/src/data/`)
- **`typeChart.ts`** - Type effectiveness data (copied from types.js, needs TS conversion)
- **`typeCombos.ts`** - Type combination rankings (copied from combos.js, needs TS conversion)

#### Components (`/web-app/src/components/`)
*Pending - Will contain reusable UI components*

#### Pages (`/web-app/src/pages/`)
*Pending - Will contain page-specific logic*

#### Utils (`/web-app/src/utils/`)
*Pending - Will contain helper functions*

#### Types (`/web-app/src/types/`)
*Pending - Will contain TypeScript interfaces*

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

### 🔄 Phase 2 Ready to Start
- Convert type data files to TypeScript
- Build Type Calculator feature
- Implement type combo recommendations

### ⏳ Future Phases
- Phase 3: Trading Hub
- Phase 4: Team Builder & PWA
- Phase 5: Android App Setup
- Phase 6: Android Features

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
1. Convert `typeChart.ts` and `typeCombos.ts` to proper TypeScript
2. Create TypeScript interfaces for type data
3. Build Type Calculator UI with dropdowns
4. Implement defensive matchup calculation logic
5. Display results with type pills and multiplier cards

### Technical Debt
- None yet - project just started

---

*This index provides comprehensive navigation for the Poke-Kit codebase. Update when significant structural changes occur.*
