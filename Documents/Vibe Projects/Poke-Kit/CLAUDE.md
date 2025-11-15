# Pokémon Tool Kit (Poke-Kit) - Project Documentation

## Project Overview

**Brief Description**: A comprehensive Pokémon companion app providing type calculators, trading resources directory, team building, and news. Available as both a Progressive Web App (PWA) and native Android application.

**Technology Stack**:
- **Web App**: Vite + TypeScript + Tailwind CSS + PWA
- **Android App**: Kotlin + Jetpack Compose + Material 3 + MVVM Architecture
- **Data Source**: PokéAPI for Pokémon data

**Key Goals**:
- Create beautiful, mobile-first Pokémon tools
- Provide offline-capable type calculator
- Direct users to safe, established trading communities
- Support both web and native Android platforms

## Project Specifications

### Environment
- **Development**: Node.js 18+, Android Studio (latest), WSL2
- **Platform**: Web (PWA), Android 8.0+ (API 26+)
- **Key Components**:
  - **Type Calculator**: Defensive type matchup calculator
  - **Trading Resources**: Directory of safe, established trading communities
  - **Team Builder**: Campaign/Competitive team recommendations
  - **Home Dashboard**: Quick actions and Pokémon news

### External Dependencies
- **PokéAPI** (api.pokeapi.co): Pokémon data, types, sprites
- **Phosphor Icons**: Icon library
- **Inter Font**: Typography

## Project Structure

```
Poke-Kit/
├── CLAUDE.md                # This file - project context
├── README.md                # User-facing documentation
├── plan/                    # Project planning documentation
│   ├── outline.md          # Phase completion tracking
│   ├── phase1.md           # Web App Foundation
│   ├── phase2.md           # Type Calculator
│   ├── phase3.md           # Trading Hub
│   ├── phase4.md           # Team Builder & PWA
│   ├── phase5.md           # Android App Setup
│   └── phase6.md           # Android Features
├── web-app/                # Progressive Web App
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── android-app/            # Native Android App
│   ├── app/
│   ├── gradle/
│   └── build.gradle.kts
└── docs/                   # Shared documentation
    ├── type-chart.json     # TYPE_CHART data
    └── design-system.md    # Pokémon design system
```

## Phase Definitions

1. **Phase 1: Web App Foundation** - Project setup, design system, navigation structure
2. **Phase 2: Type Calculator** - Core type matchup logic and UI
3. **Phase 3: Team Builder & PWA** - Team recommendations, PWA manifest, service worker
4. **Phase 4: Android App Setup** - Kotlin project, Jetpack Compose, theme system
5. **Phase 5: Android Features** - Port web features to native Android
6. **Phase 6: Trading Resources** - Informational page with curated trading community links

## Commands Reference

### Web App Development
- **Install**: `cd web-app && npm install`
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Type Check**: `npm run type-check`

### Android App Development
- **Build**: `./gradlew build`
- **Run**: `./gradlew installDebug`
- **Test**: `./gradlew test`
- **Lint**: `./gradlew lint`

## Current Status

**Current Phase**: Phase 3 - Team Builder & PWA (Ready to Start)
**Last Updated**: 2025-11-14
**Known Issues**: None

**Important Changes**:
- Original "Trading Hub" redesigned to "Trading Resources" (informational directory only) to avoid legal liability issues (COPPA compliance, moderation requirements, duty of care)
- Trading Resources moved to Phase 6 (last) as it's the simplest feature
- Prioritizing Team Builder and PWA features for more user value

## Design System: Material 3 + Pokémon Twist

### Color Palette
```css
--poke-red: #EF5350       /* Primary brand, header */
--poke-blue: #2A75BB      /* Actions, buttons */
--poke-yellow: #FFCB05    /* Accents, ratings */
--poke-dark: #333333      /* Borders, text */
--poke-light-gray: #F5F5F5 /* Background */
--poke-gray: #E0E0E0      /* Borders, dividers */
```

### Type Colors (18 Types)
All 18 Pokémon type colors defined in design-system.md

### Typography
- **Font Family**: Inter (400, 500, 600, 700 weights)
- **Headings**: Bold, 1.5-2rem
- **Body**: Regular/Medium, 0.875-1rem

### Components
- **Cards**: Rounded 1rem, subtle shadows, 1px borders
- **Buttons**: Rounded 0.75rem, blue primary, shadows
- **Inputs**: Rounded 0.75rem, 2px borders, focus states
- **Type Pills**: Circular badges with type colors
- **Nav Bar**: Bottom navigation with icon + label

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Component Structure**: Functional, single responsibility
- **State Management**: Vanilla state for web, ViewModel for Android
- **Naming**: camelCase for variables, PascalCase for components/classes
- **Comments**: Required for complex logic, type calculations, API calls

### Quality Standards
- **Accessibility**: WCAG 2.1 AA minimum
- **Performance**: Lighthouse score 90+ for web
- **Offline**: Type calculator must work offline
- **Mobile-First**: Design and test mobile first, then desktop

### Testing Strategy
- **Unit Tests**: Type calculator logic
- **Integration Tests**: API calls, data flow
- **E2E Tests**: Critical user flows (calculate types, view trades)
- **Manual Testing**: Each feature tested on mobile device

## Integration Points

### PokéAPI
- **Base URL**: https://pokeapi.co/api/v2
- **Endpoints**: /type, /pokemon, /pokemon-species
- **Caching**: Required - use Room (Android) or IndexedDB (web)
- **Rate Limiting**: Implement exponential backoff

### Trading Communities (External Links)
- **No backend integration** - Trading Resources page provides external links only
- **Communities to link**:
  - r/pokemontrades (Reddit)
  - r/CasualPokemonTrades (Reddit)
  - Serebii.net Forums
  - Smogon Trading Forums
  - Official Pokémon Discord servers
- **Link Security**: All external links use `target="_blank" rel="noopener noreferrer"`

## Notes

- Mockups are in `/mnt/c/Users/haith/OneDrive/Desktop/mockup*.html`
- Type combo rankings from Wolfe Glick (ChatGPT updating the HTML)
- Android app plan details in `/mnt/c/Users/haith/Downloads/Pokekit.pdf`
- Follow global CLAUDE coordination protocol for agent usage
