# Poke-Kit Code Audit Report
**Date**: November 27, 2025
**Auditor**: Claude Code Architecture Specialist

## Executive Summary

This audit identified ~550 lines of duplicated code across the Poke-Kit web-app codebase. Consolidating these would improve maintainability, reduce bundle size, and establish clearer architectural patterns.

---

## 1. Duplicated Functions

### 1.1 Sprite URL Generation (~30 lines)
**Files**: `nickname-generator.ts`, `team-builder.ts`, `shared/pokemonLoader.ts`

- All three have `getSpriteUrl()` functions
- `pokemonLoader.ts` has the complete implementation with Legends Z-A fallbacks
- Others have simplified versions

**Fix**: Remove local implementations, import from `shared/pokemonLoader.ts`

### 1.2 Display Name Formatting (~20 lines)
**Files**: `nickname-generator.ts`, `team-builder.ts`, `types/pokemon.ts`

- `nickname-generator.ts`: `getFullDisplayName()`
- `team-builder.ts`: `formatPokemonName()`
- `types/pokemon.ts`: `getDisplayName()` (canonical)

**Fix**: Use canonical `getDisplayName()` from `types/pokemon.ts`

### 1.3 Type Color Mapping (~25 lines)
**Files**: `team-builder.ts`, `shared/typeConfig.ts`

- `team-builder.ts`: `getTypeColor()` returns Tailwind classes
- `typeConfig.ts`: Has hex colors in `TYPE_CONFIG`

**Fix**: Add utility to `typeConfig.ts`:
```typescript
export function getTypeColorClass(type: string): string {
  return `bg-[${getTypeConfig(type).color}]`;
}
```

---

## 2. Duplicated Modal Patterns (~200 lines)

### 2.1 Modal Lifecycle
**Files**: `pokedex/movesetModal.ts`, `pokedex/matchupModal.ts`

Both modals have identical patterns:
1. Check if modal exists, create if not
2. Update modal header (sprite, name, types, bg color)
3. Show modal by removing 'hidden' class
4. Add escape key listener
5. Call `lucide.createIcons()`
6. Close function removes listeners
7. Global function exposure for onclick
8. Backdrop click handlers

**Fix**: Create base modal class in `shared/modalSystem.ts`

### 2.2 Modal Header Update (~40 lines)
**Files**: Both modals

Identical code to update sprite, name, type badges, background color.

**Fix**: Create `updateModalHeader()` in `shared/modalHelpers.ts`

---

## 3. Duplicated UI Components (~150 lines)

### 3.1 Type Badge Variants (~60 lines)
**File**: `shared/components.ts`

Three nearly identical functions:
- `TypeBadge()` - full with watermark
- `TypeBadgeSimple()` - no watermark
- `TypeBadgeTiny()` - smaller

**Fix**: Single parameterized function:
```typescript
export function TypeBadge(type: string, options?: {
  size?: 'tiny' | 'simple' | 'md';
  showIcon?: boolean;
}): string
```

### 3.2 Loading Spinner (~20 lines each)
**Files**: `nickname-generator.ts`, `team-builder.ts`, `pokedex.ts`, `movesetModal.ts`

Identical loading HTML pattern.

**Fix**: Add to `shared/components.ts`:
```typescript
export function LoadingSpinner(message = 'Loading...'): string
```

### 3.3 Empty State (~20 lines each)
**Files**: `nickname-generator.ts`, `pokedex.ts`, `team-builder.ts`

Identical empty state HTML pattern.

**Fix**: Add to `shared/components.ts`:
```typescript
export function EmptyState(icon: string, message: string): string
```

### 3.4 Type Background Splash (~15 lines each)
**Files**: `calculator.ts`, `pokedex/cardRenderer.ts`, modals

Identical opacity gradient background.

**Fix**: Add to `shared/components.ts`:
```typescript
export function TypeBackgroundSplash(typeName: string): string
```

---

## 4. Duplicated Styles

### 4.1 Frosted Glass Button
**File**: `pokedex/cardRenderer.ts`

Form cycle and calculator buttons use identical style.

**Fix**: Add to `style.css`:
```css
.frosted-button {
  @apply bg-white/10 backdrop-blur-md border border-black/10
         dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/20;
}
```

---

## 5. Duplicated Constants (~50 lines)

### 5.1 Lucide Declaration (~12 lines total)
**Files**: 6+ files declare the same `lucide` global

**Fix**: Create `types/lucide.d.ts`:
```typescript
declare global {
  const lucide: { createIcons: () => void; };
}
export {};
```

### 5.2 Error Handling Pattern (~40 lines)
**Files**: Multiple files have identical Pokemon data loading error handling

**Fix**: Add to `shared/pokemonLoader.ts`:
```typescript
export async function initializeWithPokemonData<T>(
  onSuccess: (data: PokemonCreature[]) => T,
  containerSelector: string
): Promise<T | null>
```

---

## Priority Matrix

| Task | Lines Saved | Effort | Risk | Priority |
|------|-------------|--------|------|----------|
| Lucide type declaration | 12 | Low | Low | **P1** |
| Sprite URL consolidation | 30 | Low | Low | **P1** |
| Display name consolidation | 20 | Low | Low | **P1** |
| Loading/Empty components | 80 | Medium | Low | **P2** |
| Type color utility | 25 | Low | Low | **P2** |
| Modal header helper | 40 | Medium | Medium | **P2** |
| Type badge refactor | 60 | Medium | Medium | **P3** |
| Modal system base class | 200 | High | High | **P3** |
| CSS utility classes | 30 | Low | Low | **P3** |

---

## Recommended Approach

1. **Phase 1 (Quick Wins)**: P1 items - utility consolidations
2. **Phase 2 (Components)**: P2 items - shared UI components
3. **Phase 3 (Architecture)**: P3 items - modal system refactor

---

## Files to Create

1. `types/lucide.d.ts` - Global type declaration
2. `shared/modalHelpers.ts` - Modal utility functions
3. `shared/uiComponents.ts` - Loading, Empty, Splash components

## Files to Modify

1. `shared/components.ts` - Consolidate TypeBadge variants
2. `shared/typeConfig.ts` - Add `getTypeColorClass()`
3. `shared/pokemonLoader.ts` - Add initialization helper
4. `nickname-generator.ts` - Remove local utilities
5. `team-builder.ts` - Remove local utilities
6. `style.css` - Add utility classes
