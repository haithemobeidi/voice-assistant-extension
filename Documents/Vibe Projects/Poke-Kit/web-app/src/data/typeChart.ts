// types.js
// Core type data + matchup math, modeled similarly to pkmn.help style logic.

// Canonical type list (Gen 9)
const TYPE_NAMES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic",
  "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

// Type effectiveness chart: attacker -> defender -> multiplier.
// Only entries that differ from 1 are stored; everything else defaults to 1.
// Data matches the standard modern type chart (no weird generational quirks).
const TYPE_CHART = {
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

// Get effectiveness of an attacking type into a single defending type.
function getSingleTypeMultiplier(attacker, defender) {
  const row = TYPE_CHART[attacker];
  if (!row) return 1;
  return row[defender] ?? 1;
}

// Get effectiveness into a dual-type defender.
function getDualTypeMultiplier(attacker, def1, def2) {
  const m1 = getSingleTypeMultiplier(attacker, def1);
  const m2 = def2 ? getSingleTypeMultiplier(attacker, def2) : 1;
  return m1 * m2;
}

// Compute defensive profile of a dual-type: for each attacking type,
// what multiplier do you take? Returns an array of { attacker, mult }.
function getDefensiveProfile(type1, type2 = null) {
  return TYPE_NAMES.map(attacker => ({
    attacker,
    mult: getDualTypeMultiplier(attacker, type1, type2)
  }));
}

// Simple defensive score:
//  - 4x weakness: -2
//  - 2x weakness: -1
//  - 0.5x resist: +1
//  - 0.25x (from 0.5 * 0.5): +2
//  - immunity (0x): +2
function scoreDefense(profile) {
  let score = 0;
  let weak = 0, resist = 0, immune = 0;

  for (const { mult } of profile) {
    if (mult === 0) {
      score += 2;
      immune++;
    } else if (mult > 1) {
      if (mult >= 4) {
        score -= 2;
        weak++;
      } else if (mult >= 2) {
        score -= 1;
        weak++;
      }
    } else if (mult < 1) {
      if (mult <= 0.25) {
        score += 2;
        resist++;
      } else if (mult <= 0.5) {
        score += 1;
        resist++;
      }
    }
  }

  return { score, weak, resist, immune };
}

// Offensive coverage score:
// For a dual-type attacker, for each single-type defender, use the BETTER
// of the two STAB types. Then:
//   - sum(bestMultiplier) over all defenders
// This rewards hitting more types super-effectively and not being walled.
function scoreOffense(type1, type2 = null) {
  let total = 0;
  let counts = { super: 0, neutral: 0, resisted: 0, immune: 0 };

  for (const def of TYPE_NAMES) {
    const m1 = getSingleTypeMultiplier(type1, def);
    const m2 = type2 ? getSingleTypeMultiplier(type2, def) : 1;
    const best = Math.max(m1, m2);

    total += best;

    if (best === 0) counts.immune++;
    else if (best > 1) counts.super++;
    else if (best < 1) counts.resisted++;
    else counts.neutral++;
  }

  return { score: total, ...counts };
}
