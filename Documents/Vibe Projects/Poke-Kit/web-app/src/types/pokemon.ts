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
