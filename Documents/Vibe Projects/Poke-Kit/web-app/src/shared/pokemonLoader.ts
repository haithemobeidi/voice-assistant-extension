// pokemonLoader.ts
// Lazy loader for Pokemon data - fetches JSON on-demand to reduce initial bundle size
// The pokemon.json file (~800KB) is loaded only when needed instead of bundled

import type { PokemonCreature } from '../types/pokemon';

// Cached Pokemon data - null until first load
let cachedPokemonData: PokemonCreature[] | null = null;
let loadPromise: Promise<PokemonCreature[]> | null = null;

/**
 * Load Pokemon data asynchronously
 * Returns cached data if already loaded, otherwise fetches from server
 * Multiple concurrent calls will share the same fetch promise
 */
export async function loadPokemonData(): Promise<PokemonCreature[]> {
  // Return cached data if available
  if (cachedPokemonData) {
    return cachedPokemonData;
  }

  // If already loading, return existing promise to avoid duplicate fetches
  if (loadPromise) {
    return loadPromise;
  }

  // Start new load
  loadPromise = (async () => {
    try {
      const response = await fetch('/data/pokemon.json');
      if (!response.ok) {
        throw new Error(`Failed to load Pokemon data: ${response.status}`);
      }
      const data = await response.json();
      cachedPokemonData = data as PokemonCreature[];
      return cachedPokemonData;
    } catch (error) {
      // Clear promise so retry is possible
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Check if Pokemon data is already loaded
 */
export function isPokemonDataLoaded(): boolean {
  return cachedPokemonData !== null;
}

/**
 * Get cached Pokemon data synchronously (returns null if not yet loaded)
 * Use this only after confirming data is loaded via isPokemonDataLoaded()
 */
export function getPokemonDataSync(): PokemonCreature[] | null {
  return cachedPokemonData;
}

/**
 * Preload Pokemon data without waiting
 * Useful for triggering load early in app lifecycle
 */
export function preloadPokemonData(): void {
  loadPokemonData().catch(console.error);
}
