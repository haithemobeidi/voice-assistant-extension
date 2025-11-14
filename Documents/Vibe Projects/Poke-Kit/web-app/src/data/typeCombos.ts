// typeCombos.ts
// Wolfe Glick's competitive tier rankings for all dual-type combinations
// Rank 1 (best) → 153 (worst) based on defensive/offensive balance

import type { TierRank, TypeCombo, TierDescription, PokemonType } from '../types/pokemon';

/**
 * Tier order from best to worst
 * Used for sorting and display logic
 */
export const TIER_ORDER: readonly TierRank[] = ["S", "A", "B", "C", "D", "F"] as const;

/**
 * Tier descriptions explaining what each tier means competitively
 */
export const TIER_DESCRIPTIONS: readonly TierDescription[] = [
  {
    tier: "S",
    description: "Ridiculously strong combinations. Top of the meta in Wolfe's view."
  },
  {
    tier: "A",
    description: "Very strong pairings that usually help more than they hurt."
  },
  {
    tier: "B",
    description: "Solid overall. Good but not busted."
  },
  {
    tier: "C",
    description: "Fine / average. Not amazing, not awful."
  },
  {
    tier: "D",
    description: "Actively problematic typing-wise."
  },
  {
    tier: "F",
    description: "You pick these for flavor, not sanity."
  }
] as const;

/**
 * Get tier description by tier rank
 */
export function getTierDescription(tier: TierRank): string {
  const found = TIER_DESCRIPTIONS.find(t => t.tier === tier);
  return found?.description ?? "Unknown tier";
}

/**
 * All 153 dual-type combinations ranked by competitive viability
 * Rankings based on Wolfe Glick's analysis (VGC World Champion)
 *
 * Note: Single-type Pokémon are not included in this ranking system
 * as they have different strategic considerations
 */
export const TYPE_COMBOS: readonly TypeCombo[] = [
  // S-Tier: Ridiculously strong combinations
  { rank: 1,  tier: "S", types: ["Fairy", "Steel"] },
  { rank: 2,  tier: "S", types: ["Normal", "Ghost"] },
  { rank: 3,  tier: "S", types: ["Fairy", "Ground"] },
  { rank: 4,  tier: "S", types: ["Water", "Fairy"] },
  { rank: 5,  tier: "S", types: ["Flying", "Ground"] },
  { rank: 6,  tier: "S", types: ["Water", "Ground"] },
  { rank: 7,  tier: "S", types: ["Poison", "Dark"] },
  { rank: 8,  tier: "S", types: ["Bug", "Steel"] },

  // A-Tier: Very strong pairings
  { rank: 9,  tier: "A", types: ["Ice", "Ground"] },
  { rank: 10, tier: "A", types: ["Steel", "Ground"] },
  { rank: 11, tier: "A", types: ["Steel", "Ghost"] },
  { rank: 12, tier: "A", types: ["Dragon", "Water"] },
  { rank: 13, tier: "A", types: ["Fire", "Dark"] },
  { rank: 14, tier: "A", types: ["Fire", "Fairy"] },
  { rank: 15, tier: "A", types: ["Electric", "Fairy"] },
  { rank: 16, tier: "A", types: ["Steel", "Fighting"] },
  { rank: 17, tier: "A", types: ["Steel", "Dragon"] },
  { rank: 18, tier: "A", types: ["Ghost", "Water"] },
  { rank: 19, tier: "A", types: ["Ghost", "Fighting"] },
  { rank: 20, tier: "A", types: ["Electric", "Fighting"] },
  { rank: 21, tier: "A", types: ["Electric", "Flying"] },
  { rank: 22, tier: "A", types: ["Water", "Dark"] },
  { rank: 23, tier: "A", types: ["Steel", "Water"] },
  { rank: 24, tier: "A", types: ["Water", "Fighting"] },
  { rank: 25, tier: "A", types: ["Fire", "Psychic"] },
  { rank: 26, tier: "A", types: ["Steel", "Psychic"] },
  { rank: 27, tier: "A", types: ["Steel", "Flying"] },
  { rank: 28, tier: "A", types: ["Water", "Psychic"] },
  { rank: 29, tier: "A", types: ["Steel", "Fire"] },
  { rank: 30, tier: "A", types: ["Fairy", "Fighting"] },
  { rank: 31, tier: "A", types: ["Electric", "Steel"] },
  { rank: 32, tier: "A", types: ["Steel", "Grass"] },
  { rank: 33, tier: "A", types: ["Fairy", "Dark"] },
  { rank: 34, tier: "A", types: ["Water", "Normal"] },

  // B-Tier: Solid overall
  { rank: 35, tier: "B", types: ["Poison", "Water"] },
  { rank: 36, tier: "B", types: ["Water", "Bug"] },
  { rank: 37, tier: "B", types: ["Ghost", "Fire"] },
  { rank: 38, tier: "B", types: ["Ghost", "Electric"] },
  { rank: 39, tier: "B", types: ["Dragon", "Fire"] },
  { rank: 40, tier: "B", types: ["Bug", "Electric"] },
  { rank: 41, tier: "B", types: ["Fighting", "Flying"] },
  { rank: 42, tier: "B", types: ["Ghost", "Ground"] },
  { rank: 43, tier: "B", types: ["Water", "Flying"] },
  { rank: 44, tier: "B", types: ["Electric", "Psychic"] },
  { rank: 45, tier: "B", types: ["Ghost", "Dragon"] },
  { rank: 46, tier: "B", types: ["Electric", "Dark"] },
  { rank: 47, tier: "B", types: ["Fire", "Ground"] },
  { rank: 48, tier: "B", types: ["Ghost", "Fairy"] },
  { rank: 49, tier: "B", types: ["Fire", "Fighting"] },
  { rank: 50, tier: "B", types: ["Steel", "Dark"] },
  { rank: 51, tier: "B", types: ["Steel", "Poison"] },
  { rank: 52, tier: "B", types: ["Electric", "Normal"] },
  { rank: 53, tier: "B", types: ["Ghost", "Flying"] },
  { rank: 54, tier: "B", types: ["Dragon", "Fairy"] },
  { rank: 55, tier: "B", types: ["Ice", "Electric"] },
  { rank: 56, tier: "B", types: ["Dragon", "Poison"] },
  { rank: 57, tier: "B", types: ["Ghost", "Rock"] },
  { rank: 58, tier: "B", types: ["Fairy", "Normal"] },
  { rank: 59, tier: "B", types: ["Dragon", "Normal"] },
  { rank: 60, tier: "B", types: ["Ghost", "Poison"] },
  { rank: 61, tier: "B", types: ["Grass", "Fire"] },
  { rank: 62, tier: "B", types: ["Dragon", "Ground"] },
  { rank: 63, tier: "B", types: ["Fairy", "Poison"] },
  { rank: 64, tier: "B", types: ["Fighting", "Ground"] },
  { rank: 65, tier: "B", types: ["Ghost", "Dark"] },
  { rank: 66, tier: "B", types: ["Normal", "Ground"] },
  { rank: 67, tier: "B", types: ["Poison", "Grass"] },
  { rank: 68, tier: "B", types: ["Bug", "Fire"] },
  { rank: 69, tier: "B", types: ["Fairy", "Flying"] },
  { rank: 70, tier: "B", types: ["Psychic", "Fairy"] },
  { rank: 71, tier: "B", types: ["Rock", "Fairy"] },

  // C-Tier: Fine/average
  { rank: 72, tier: "C", types: ["Grass", "Ghost"] },
  { rank: 73, tier: "C", types: ["Dark", "Flying"] },
  { rank: 74, tier: "C", types: ["Rock", "Fighting"] },
  { rank: 75, tier: "C", types: ["Fire", "Water"] },
  { rank: 76, tier: "C", types: ["Dragon", "Electric"] },
  { rank: 77, tier: "C", types: ["Electric", "Water"] },
  { rank: 78, tier: "C", types: ["Poison", "Ground"] },
  { rank: 79, tier: "C", types: ["Bug", "Ground"] },
  { rank: 80, tier: "C", types: ["Bug", "Ghost"] },
  { rank: 81, tier: "C", types: ["Dark", "Ground"] },
  { rank: 82, tier: "C", types: ["Psychic", "Fighting"] },
  { rank: 83, tier: "C", types: ["Electric", "Ground"] },
  { rank: 84, tier: "C", types: ["Psychic", "Normal"] },
  { rank: 85, tier: "C", types: ["Steel", "Normal"] },
  { rank: 86, tier: "C", types: ["Rock", "Water"] },
  { rank: 87, tier: "C", types: ["Psychic", "Ground"] },
  { rank: 88, tier: "C", types: ["Flying", "Poison"] },
  { rank: 89, tier: "C", types: ["Electric", "Poison"] },
  { rank: 90, tier: "C", types: ["Ice", "Fighting"] },
  { rank: 91, tier: "C", types: ["Fire", "Normal"] },
  { rank: 92, tier: "C", types: ["Rock", "Flying"] },
  { rank: 93, tier: "C", types: ["Ghost", "Ice"] },
  { rank: 94, tier: "C", types: ["Grass", "Dark"] },
  { rank: 95, tier: "C", types: ["Normal", "Fighting"] },
  { rank: 96, tier: "C", types: ["Grass", "Water"] },
  { rank: 97, tier: "C", types: ["Fire", "Flying"] },
  { rank: 98, tier: "C", types: ["Psychic", "Poison"] },
  { rank: 99, tier: "C", types: ["Dragon", "Ice"] },
  { rank: 100, tier: "C", types: ["Electric", "Grass"] },
  { rank: 101, tier: "C", types: ["Grass", "Normal"] },
  { rank: 102, tier: "C", types: ["Bug", "Dragon"] },
  { rank: 103, tier: "C", types: ["Dark", "Dragon"] },
  { rank: 104, tier: "C", types: ["Normal", "Flying"] },
  { rank: 105, tier: "C", types: ["Dragon", "Psychic"] },
  { rank: 106, tier: "C", types: ["Fire", "Poison"] },
  { rank: 107, tier: "C", types: ["Dragon", "Fighting"] },
  { rank: 108, tier: "C", types: ["Dragon", "Flying"] },
  { rank: 109, tier: "C", types: ["Rock", "Grass"] },
  { rank: 110, tier: "C", types: ["Flying", "Psychic"] },
  { rank: 111, tier: "C", types: ["Fighting", "Poison"] },
  { rank: 112, tier: "C", types: ["Bug", "Rock"] },
  { rank: 113, tier: "C", types: ["Grass", "Fairy"] },

  // D-Tier: Actively problematic
  { rank: 114, tier: "D", types: ["Fire", "Electric"] },
  { rank: 115, tier: "D", types: ["Water", "Ice"] },
  { rank: 116, tier: "D", types: ["Ice", "Poison"] },
  { rank: 117, tier: "D", types: ["Bug", "Fairy"] },
  { rank: 118, tier: "D", types: ["Bug", "Psychic"] },
  { rank: 119, tier: "D", types: ["Dark", "Normal"] },
  { rank: 120, tier: "D", types: ["Rock", "Steel"] },
  { rank: 121, tier: "D", types: ["Dark", "Fighting"] },
  { rank: 122, tier: "D", types: ["Steel", "Ice"] },
  { rank: 123, tier: "D", types: ["Ghost", "Psychic"] },
  { rank: 124, tier: "D", types: ["Grass", "Fighting"] },
  { rank: 125, tier: "D", types: ["Dark", "Ice"] },
  { rank: 126, tier: "D", types: ["Ice", "Psychic"] },
  { rank: 127, tier: "D", types: ["Dark", "Bug"] },
  { rank: 128, tier: "D", types: ["Grass", "Flying"] },
  { rank: 129, tier: "D", types: ["Bug", "Poison"] },
  { rank: 130, tier: "D", types: ["Rock", "Psychic"] },
  { rank: 131, tier: "D", types: ["Dragon", "Grass"] },
  { rank: 132, tier: "D", types: ["Dragon", "Rock"] },
  { rank: 133, tier: "D", types: ["Fire", "Ice"] },
  { rank: 134, tier: "D", types: ["Ice", "Fairy"] },
  { rank: 135, tier: "D", types: ["Rock", "Electric"] },
  { rank: 136, tier: "D", types: ["Rock", "Poison"] },
  { rank: 137, tier: "D", types: ["Ice", "Flying"] },
  { rank: 138, tier: "D", types: ["Ground", "Rock"] },
  { rank: 139, tier: "D", types: ["Ground", "Grass"] },
  { rank: 140, tier: "D", types: ["Normal", "Rock"] },
  { rank: 141, tier: "D", types: ["Bug", "Fighting"] },
  { rank: 142, tier: "D", types: ["Normal", "Poison"] },

  // F-Tier: Picked for flavor, not sanity
  { rank: 143, tier: "F", types: ["Fire", "Rock"] },
  { rank: 144, tier: "F", types: ["Dark", "Rock"] },
  { rank: 145, tier: "F", types: ["Bug", "Normal"] },
  { rank: 146, tier: "F", types: ["Grass", "Psychic"] },
  { rank: 147, tier: "F", types: ["Normal", "Ice"] },
  { rank: 148, tier: "F", types: ["Bug", "Flying"] },
  { rank: 149, tier: "F", types: ["Grass", "Ice"] },
  { rank: 150, tier: "F", types: ["Grass", "Bug"] },
  { rank: 151, tier: "F", types: ["Dark", "Psychic"] },
  { rank: 152, tier: "F", types: ["Ice", "Rock"] },
  { rank: 153, tier: "F", types: ["Bug", "Ice"] }
] as const;

/**
 * Find type combo ranking by type combination
 * @param type1 - Primary type
 * @param type2 - Secondary type
 * @returns TypeCombo object or undefined if not found
 *
 * @example
 * findTypeCombo("Fairy", "Steel") // → { rank: 1, tier: "S", types: ["Fairy", "Steel"] }
 * findTypeCombo("Steel", "Fairy") // → { rank: 1, tier: "S", types: ["Fairy", "Steel"] } (order doesn't matter)
 */
export function findTypeCombo(
  type1: PokemonType,
  type2: PokemonType
): TypeCombo | undefined {
  return TYPE_COMBOS.find(combo =>
    (combo.types[0] === type1 && combo.types[1] === type2) ||
    (combo.types[0] === type2 && combo.types[1] === type1)
  );
}

/**
 * Get all type combos for a specific tier
 * @param tier - Tier rank (S, A, B, C, D, F)
 * @returns Array of type combos in that tier
 *
 * @example
 * getCombosByTier("S") // → All 8 S-tier combinations
 */
export function getCombosByTier(tier: TierRank): readonly TypeCombo[] {
  return TYPE_COMBOS.filter(combo => combo.tier === tier);
}

/**
 * Get top N type combos by rank
 * @param n - Number of top combos to return
 * @returns Array of the best N type combinations
 *
 * @example
 * getTopCombos(10) // → Top 10 combinations (ranks 1-10)
 */
export function getTopCombos(n: number): readonly TypeCombo[] {
  return TYPE_COMBOS.slice(0, n);
}

/**
 * Get bottom N type combos by rank
 * @param n - Number of bottom combos to return
 * @returns Array of the worst N type combinations
 *
 * @example
 * getBottomCombos(10) // → Bottom 10 combinations (ranks 144-153)
 */
export function getBottomCombos(n: number): readonly TypeCombo[] {
  return TYPE_COMBOS.slice(-n);
}
