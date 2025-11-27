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

// New Mega Evolutions from Legends Z-A (IDs 10278+) that don't have sprites yet
// Map from Pokemon name to their base form's national dex number for sprite fallback
const LEGENDS_ZA_MEGA_FALLBACKS: Record<string, number> = {
  'clefable-mega': 36,
  'victreebel-mega': 71,
  'starmie-mega': 121,
  'dragonite-mega': 149,
  'meganium-mega': 154,
  'feraligatr-mega': 160,
  'skarmory-mega': 227,
  'froslass-mega': 478,
  'emboar-mega': 500,
  'excadrill-mega': 530,
  'scolipede-mega': 545,
  'scrafty-mega': 560,
  'eelektross-mega': 604,
  'chandelure-mega': 609,
  'chesnaught-mega': 652,
  'delphox-mega': 655,
  'greninja-mega': 658,
  'pyroar-mega': 668,
  'floette-mega': 670,
  'malamar-mega': 687,
  'barbaracle-mega': 689,
  'dragalge-mega': 691,
  'hawlucha-mega': 701,
  'zygarde-mega': 718,
  'drampa-mega': 780,
  'falinks-mega': 870,
};

/**
 * Get the official artwork sprite URL for a Pokemon
 * For new Legends Z-A Megas that don't have sprites, falls back to base form
 */
export function getSpriteUrl(pokemon: { name: string; id: string; number: number }): string {
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

  // Check if this is a new Z-A Mega that needs fallback
  const fallbackNumber = LEGENDS_ZA_MEGA_FALLBACKS[pokemon.name];
  if (fallbackNumber) {
    return `${baseUrl}/${fallbackNumber}.png`;
  }

  // Use the Pokemon's ID for the sprite
  return `${baseUrl}/${pokemon.id}.png`;
}
