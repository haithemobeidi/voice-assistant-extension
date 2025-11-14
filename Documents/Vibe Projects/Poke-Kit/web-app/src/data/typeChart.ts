// typeChart.ts
// Core type data + matchup math for Pokémon type effectiveness calculations
// Data matches the standard modern type chart (Gen 9, no generational quirks)

import type {
  PokemonType,
  TypeMultiplier,
  TypeEffectivenessChart,
  DefensiveMatchup,
  DefensiveProfile,
  OffensiveProfile
} from '../types/pokemon';

/**
 * Canonical list of all 18 Pokémon types (Gen 9)
 * Order matches standard Pokédex type ordering
 */
export const TYPE_NAMES: readonly PokemonType[] = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic",
  "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
] as const;

/**
 * Type effectiveness chart: attacker → defender → multiplier
 * Only stores non-neutral (≠ 1) matchups for efficiency
 * All omitted matchups default to 1 (neutral damage)
 *
 * Key:
 * - 0: Immune (no effect)
 * - 0.5: Resisted (not very effective)
 * - 2: Super effective
 *
 * Note: Dual-type defenders multiply matchups (e.g., 0.5 × 0.5 = 0.25, 2 × 2 = 4)
 */
export const TYPE_CHART: TypeEffectivenessChart = {
  Normal:  { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:    { Grass: 2, Ice: 2, Bug: 2, Steel: 2, Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5 },
  Water:   { Fire: 2, Ground: 2, Rock: 2, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
  Electric:{ Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Dragon: 0.5, Ground: 0 },
  Grass:   { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Poison: 0.5, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5 },
  Ice:     { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
  Fighting:{ Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Fairy: 0.5, Ghost: 0 },
  Poison:  { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
  Ground:  { Fire: 2, Electric: 2, Poison: 2, Rock: 2, Steel: 2, Grass: 0.5, Bug: 0.5, Flying: 0 },
  Flying:  { Grass: 2, Fighting: 2, Bug: 2, Electric: 0.5, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
  Bug:     { Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
  Rock:    { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
  Ghost:   { Psychic: 2, Ghost: 2, Dark: 0.5, Normal: 0 },
  Dragon:  { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:    { Psychic: 2, Ghost: 2, Fighting: 0.5, Dark: 0.5, Fairy: 0.5 },
  Steel:   { Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
  Fairy:   { Fighting: 2, Dragon: 2, Dark: 2, Fire: 0.5, Poison: 0.5, Steel: 0.5 }
};

/**
 * Get type effectiveness multiplier when an attacking type hits a single defending type
 *
 * @param attacker - The attacking type
 * @param defender - The defending type
 * @returns Damage multiplier (0, 0.5, 1, or 2)
 *
 * @example
 * getSingleTypeMultiplier("Fire", "Grass") // → 2 (super effective)
 * getSingleTypeMultiplier("Water", "Fire") // → 2 (super effective)
 * getSingleTypeMultiplier("Normal", "Ghost") // → 0 (immune)
 * getSingleTypeMultiplier("Fire", "Water") // → 0.5 (resisted)
 */
export function getSingleTypeMultiplier(
  attacker: PokemonType,
  defender: PokemonType
): TypeMultiplier {
  const row = TYPE_CHART[attacker];
  if (!row) return 1; // No special matchups = neutral
  return (row[defender] ?? 1) as TypeMultiplier; // Default to neutral if not in chart
}

/**
 * Get type effectiveness multiplier when an attacking type hits a dual-type defender
 * Multiplies the matchups against both defending types
 *
 * @param attacker - The attacking type
 * @param def1 - Primary defending type
 * @param def2 - Secondary defending type (optional)
 * @returns Combined damage multiplier (0, 0.25, 0.5, 1, 2, or 4)
 *
 * @example
 * getDualTypeMultiplier("Ground", "Fire", "Steel") // → 4 (2 × 2 = 4x weakness)
 * getDualTypeMultiplier("Fire", "Grass", "Steel") // → 1 (2 × 0.5 = neutral)
 * getDualTypeMultiplier("Fighting", "Normal", "Ghost") // → 0 (2 × 0 = immune)
 */
export function getDualTypeMultiplier(
  attacker: PokemonType,
  def1: PokemonType,
  def2?: PokemonType | null
): TypeMultiplier {
  const m1 = getSingleTypeMultiplier(attacker, def1);
  const m2 = def2 ? getSingleTypeMultiplier(attacker, def2) : 1;
  return (m1 * m2) as TypeMultiplier;
}

/**
 * Compute complete defensive profile for a type combination
 * Shows how the type(s) fare defensively against all 18 attacking types
 *
 * @param type1 - Primary type
 * @param type2 - Secondary type (optional)
 * @returns Array of defensive matchups for each attacking type
 *
 * @example
 * getDefensiveProfile("Steel", "Fairy")
 * // Returns matchups showing immunities to Dragon/Poison, many resistances
 */
export function getDefensiveProfile(
  type1: PokemonType,
  type2?: PokemonType | null
): DefensiveMatchup[] {
  return TYPE_NAMES.map(attacker => ({
    attacker,
    mult: getDualTypeMultiplier(attacker, type1, type2)
  }));
}

/**
 * Calculate defensive score for a type combination
 * Scoring system:
 * - 4x weakness: -2 points
 * - 2x weakness: -1 point
 * - 0.5x resistance: +1 point
 * - 0.25x double resistance: +2 points
 * - Immunity (0x): +2 points
 *
 * Higher scores = better defensive typing
 *
 * @param profile - Array of defensive matchups from getDefensiveProfile()
 * @returns Defensive score and breakdown of weaknesses/resistances/immunities
 *
 * @example
 * const profile = getDefensiveProfile("Steel", "Fairy");
 * const score = scoreDefense(profile);
 * // score = { score: 18, weak: 2, resist: 9, immune: 2 }
 * // Steel/Fairy has incredible defensive typing (S-tier)
 */
export function scoreDefense(profile: DefensiveMatchup[]): {
  score: number;
  weak: number;
  resist: number;
  immune: number;
} {
  let score = 0;
  let weak = 0, resist = 0, immune = 0;

  for (const { mult } of profile) {
    if (mult === 0) {
      // Immunity
      score += 2;
      immune++;
    } else if (mult > 1) {
      // Weakness
      if (mult >= 4) {
        score -= 2; // 4x weakness
        weak++;
      } else if (mult >= 2) {
        score -= 1; // 2x weakness
        weak++;
      }
    } else if (mult < 1) {
      // Resistance
      if (mult <= 0.25) {
        score += 2; // 0.25x double resistance
        resist++;
      } else if (mult <= 0.5) {
        score += 1; // 0.5x resistance
        resist++;
      }
    }
  }

  return { score, weak, resist, immune };
}

/**
 * Calculate offensive coverage score for a type combination
 * For dual-type attackers, uses the BETTER of the two STAB types against each defender
 *
 * Scoring:
 * - Sum of best multipliers against all 18 types
 * - Higher score = better offensive coverage
 * - Perfect neutral coverage = 18 points
 * - More super-effective hits = higher score
 *
 * @param type1 - Primary attacking type
 * @param type2 - Secondary attacking type (optional)
 * @returns Offensive score and breakdown of coverage statistics
 *
 * @example
 * scoreOffense("Ground", "Ice")
 * // Returns high score - Ground hits Electric/Fire/Poison/Rock/Steel,
 * // Ice hits Grass/Ground/Flying/Dragon, excellent coverage together
 */
export function scoreOffense(
  type1: PokemonType,
  type2?: PokemonType | null
): OffensiveProfile {
  let total = 0;
  let counts = { super: 0, neutral: 0, resisted: 0, immune: 0 };

  for (const def of TYPE_NAMES) {
    const m1 = getSingleTypeMultiplier(type1, def);
    const m2 = type2 ? getSingleTypeMultiplier(type2, def) : 1;
    const best = Math.max(m1, m2); // Use better STAB coverage

    total += best;

    // Count coverage categories
    if (best === 0) counts.immune++;
    else if (best > 1) counts.super++;
    else if (best < 1) counts.resisted++;
    else counts.neutral++;
  }

  return { score: total, ...counts };
}

/**
 * Get complete defensive analysis for a type combination
 * Combines matchup data with defensive scoring
 *
 * @param type1 - Primary type
 * @param type2 - Secondary type (optional)
 * @returns Full defensive profile with matchups and score breakdown
 */
export function getFullDefensiveProfile(
  type1: PokemonType,
  type2?: PokemonType | null
): DefensiveProfile {
  const matchups = getDefensiveProfile(type1, type2);
  const scoreData = scoreDefense(matchups);

  return {
    matchups,
    score: {
      total: scoreData.score,
      weak: scoreData.weak,
      resist: scoreData.resist,
      immune: scoreData.immune
    }
  };
}
