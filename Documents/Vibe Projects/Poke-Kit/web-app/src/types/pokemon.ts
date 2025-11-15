// pokemon.ts
// TypeScript type definitions for Pokémon type system data

/**
 * All 18 Pokémon types in Generation 9
 */
export type PokemonType =
  | "Normal" | "Fire" | "Water" | "Electric" | "Grass" | "Ice"
  | "Fighting" | "Poison" | "Ground" | "Flying" | "Psychic"
  | "Bug" | "Rock" | "Ghost" | "Dragon" | "Dark" | "Steel" | "Fairy";

/**
 * Type effectiveness multiplier values:
 * - 0: Immune (no effect)
 * - 0.25: Double resistance (0.5 × 0.5 for dual-types)
 * - 0.5: Resisted (not very effective)
 * - 1: Neutral (normal damage)
 * - 2: Super effective
 * - 4: Double weakness (2 × 2 for dual-types)
 */
export type TypeMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

/**
 * Type effectiveness chart: maps defending type to damage multiplier
 * Only stores non-neutral (≠ 1) matchups for efficiency
 */
export type TypeEffectivenessChart = {
  [attackingType in PokemonType]?: {
    [defendingType in PokemonType]?: TypeMultiplier;
  };
};

/**
 * Defensive matchup result for a single attacking type
 */
export interface DefensiveMatchup {
  /** The attacking type */
  attacker: PokemonType;
  /** Damage multiplier (0, 0.25, 0.5, 1, 2, or 4) */
  mult: TypeMultiplier;
}

/**
 * Complete defensive profile showing how a type combination fares against all 18 types
 */
export interface DefensiveProfile {
  /** Array of matchups for each attacking type */
  matchups: DefensiveMatchup[];
  /** Defensive score calculation */
  score: {
    /** Overall defensive score (higher is better) */
    total: number;
    /** Number of weaknesses (2x or 4x) */
    weak: number;
    /** Number of resistances (0.5x or 0.25x) */
    resist: number;
    /** Number of immunities (0x) */
    immune: number;
  };
}

/**
 * Offensive coverage statistics for a type combination
 */
export interface OffensiveProfile {
  /** Overall offensive coverage score */
  score: number;
  /** Number of types hit super-effectively */
  super: number;
  /** Number of types hit neutrally */
  neutral: number;
  /** Number of types resisted */
  resisted: number;
  /** Number of types immune to both types */
  immune: number;
}

/**
 * Tier ranking for type combinations (Wolfe Glick's ratings)
 */
export type TierRank = "S" | "A" | "B" | "C" | "D" | "F";

/**
 * Type combination with competitive tier ranking
 */
export interface TypeCombo {
  /** Ranking position (1 = best, 153 = worst) */
  rank: number;
  /** Tier classification */
  tier: TierRank;
  /** Primary and secondary type (or just primary for single-type) */
  types: [PokemonType] | [PokemonType, PokemonType];
}

/**
 * Tier description explaining what each tier means
 */
export interface TierDescription {
  tier: TierRank;
  description: string;
}

// ============================================================================
// Pokémon Creature Data Types (for Pokédex and Team Builder)
// ============================================================================

/**
 * Lowercase type names as they appear in pokemon.json
 * Maps to PokemonType but in lowercase format
 */
export type PokemonTypeLowercase =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic"
  | "bug" | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

/**
 * Multilingual species names for a Pokémon
 * Contains translations in multiple languages from pkmn.help data
 */
export interface SpeciesNames {
  'ja-Hrkt': string;  // Japanese (Hiragana/Katakana)
  roomaji: string;    // Romanized Japanese
  ko: string;         // Korean
  'zh-Hant': string;  // Traditional Chinese
  fr: string;         // French
  de: string;         // German
  es: string;         // Spanish
  it: string;         // Italian
  en: string;         // English (primary display name)
  ja: string;         // Japanese
  'zh-Hans': string;  // Simplified Chinese
}

/**
 * Form-specific names for Pokémon with alternate forms
 * e.g., Mega Evolutions, Regional Forms, Gigantamax
 */
export interface FormNames {
  [key: string]: string;
}

/**
 * Complete Pokémon creature data model
 * Data source: pkmn.help merged-pokemon.json
 * Includes stats, types, names, and metadata for 1000+ Pokémon
 */
export interface PokemonCreature {
  name: string;                        // Internal identifier (e.g., "bulbasaur", "charizard-mega-x")
  speciesNames: SpeciesNames;          // Multilingual display names
  formNames: FormNames;                // Alternate form names (if applicable)
  number: number;                      // National Pokédex number (1-1010+)
  id: string;                          // String version of Pokédex number

  // Base stats (used for competitive battling)
  hp: number;                          // Hit Points
  attack: number;                      // Physical attack power
  defense: number;                     // Physical defense
  spAttack: number;                    // Special attack power (Sp. Atk)
  spDefense: number;                   // Special defense (Sp. Def)
  speed: number;                       // Turn order priority

  // Type information (lowercase in JSON, TitleCase in UI)
  types: PokemonTypeLowercase[];       // 1-2 types (e.g., ["grass", "poison"])

  // Metadata
  hasShiny: boolean;                   // Whether shiny sprite is available
  hasCry: boolean;                     // Whether cry sound effect is available
}

/**
 * Grouped Pokémon by species (base form + variants)
 */
export interface PokemonGroup {
  basePokemon: PokemonCreature;                     // Base form (no suffix)
  variants: PokemonCreature[];                       // Alternate forms (Mega, Regional, etc.)
  generation: number;                                // Generation number (1-9)
}

/**
 * Pokédex browser state for filtering and sorting
 */
export interface PokedexState {
  allPokemon: PokemonCreature[];                    // Full dataset
  pokemonGroups: PokemonGroup[];                     // Grouped by species
  filteredGroups: PokemonGroup[];                    // After search/filter applied
  searchQuery: string;                               // Current search text
  typeFilter: PokemonTypeLowercase | null;          // Filter by type (null = show all)
  sortBy: 'number' | 'name' | 'hp' | 'attack' | 'defense' | 'speed' | 'total';
  sortOrder: 'asc' | 'desc';
  expandedPokemon: Set<number>;                      // Track which Pokémon are expanded
}

// ============================================================================
// Utility Functions for Pokémon Creatures
// ============================================================================

/**
 * Calculate total base stats for a Pokémon
 * Used for sorting and competitive analysis
 */
export function getTotalStats(pokemon: PokemonCreature): number {
  return pokemon.hp + pokemon.attack + pokemon.defense +
         pokemon.spAttack + pokemon.spDefense + pokemon.speed;
}

/**
 * Get display name for a Pokémon (English by default)
 * Falls back to internal name if English not available
 */
export function getDisplayName(pokemon: PokemonCreature): string {
  return pokemon.speciesNames.en || pokemon.name;
}

/**
 * Check if Pokémon has a specific type
 * Useful for filtering by type
 */
export function hasType(pokemon: PokemonCreature, type: PokemonTypeLowercase): boolean {
  return pokemon.types.includes(type);
}

/**
 * Format Pokédex number with leading zeros
 * e.g., 1 → "#001", 150 → "#150"
 */
export function formatPokedexNumber(number: number): string {
  return `#${number.toString().padStart(3, '0')}`;
}

/**
 * Convert lowercase type to TitleCase for display/type calculator
 * e.g., "grass" → "Grass", "fire" → "Fire"
 */
export function toTitleCaseType(type: PokemonTypeLowercase): PokemonType {
  return (type.charAt(0).toUpperCase() + type.slice(1)) as PokemonType;
}

/**
 * Convert TitleCase type to lowercase for data lookups
 * e.g., "Grass" → "grass", "Fire" → "fire"
 */
export function toLowercaseType(type: PokemonType): PokemonTypeLowercase {
  return type.toLowerCase() as PokemonTypeLowercase;
}

/**
 * Get generation number from Pokédex number
 * Based on National Pokédex ranges
 */
export function getGeneration(pokedexNumber: number): number {
  if (pokedexNumber <= 151) return 1;   // Gen 1: Kanto (Red/Blue/Yellow)
  if (pokedexNumber <= 251) return 2;   // Gen 2: Johto (Gold/Silver/Crystal)
  if (pokedexNumber <= 386) return 3;   // Gen 3: Hoenn (Ruby/Sapphire/Emerald)
  if (pokedexNumber <= 493) return 4;   // Gen 4: Sinnoh (Diamond/Pearl/Platinum)
  if (pokedexNumber <= 649) return 5;   // Gen 5: Unova (Black/White)
  if (pokedexNumber <= 721) return 6;   // Gen 6: Kalos (X/Y)
  if (pokedexNumber <= 809) return 7;   // Gen 7: Alola (Sun/Moon/Ultra)
  if (pokedexNumber <= 905) return 8;   // Gen 8: Galar (Sword/Shield)
  return 9;                              // Gen 9: Paldea (Scarlet/Violet)
}

/**
 * Get form/variant information from Pokémon name
 * Returns form name and debut game
 */
export function getFormInfo(pokemon: PokemonCreature): { formName: string; debutGame: string } | null {
  const name = pokemon.name.toLowerCase();

  // Check for Mega Evolution
  if (name.includes('-mega')) {
    const megaType = name.includes('-mega-x') ? ' X' : name.includes('-mega-y') ? ' Y' : '';
    return { formName: `Mega${megaType}`, debutGame: 'Pokémon X/Y (Gen 6)' };
  }

  // Check for Regional Forms
  if (name.includes('-alola')) {
    return { formName: 'Alola Form', debutGame: 'Pokémon Sun/Moon (Gen 7)' };
  }
  if (name.includes('-galar')) {
    return { formName: 'Galar Form', debutGame: 'Pokémon Sword/Shield (Gen 8)' };
  }
  if (name.includes('-hisui')) {
    return { formName: 'Hisui Form', debutGame: 'Pokémon Legends: Arceus (Gen 8)' };
  }
  if (name.includes('-paldea')) {
    return { formName: 'Paldea Form', debutGame: 'Pokémon Scarlet/Violet (Gen 9)' };
  }

  // Check for Gigantamax
  if (name.includes('-gmax')) {
    return { formName: 'Gigantamax', debutGame: 'Pokémon Sword/Shield (Gen 8)' };
  }

  // Base form
  return null;
}
