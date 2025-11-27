// pokedex/cardRenderer.ts
// Handles rendering of Pokémon cards - both front and back with flip animation

import type { PokemonCreature, PokemonGroup } from '../types/pokemon';
import { getTotalStats, getDisplayName, formatPokedexNumber } from '../types/pokemon';
import { getTypeConfig } from '../shared/typeConfig';
import { TypeBadgeSimple, TypeBadgeTiny } from '../shared/components';
import { POKEDEX_CONFIG } from '../shared/config';
import { getSpriteUrl } from '../shared/pokemonLoader';

// ============================================================================
// CARD RENDERING
// ============================================================================

/**
 * Create a single Pokémon floating card with flip animation
 * Front: sprite, name, types, BST
 * Back: detailed stat bars
 */
export function createPokemonCard(group: PokemonGroup): string {
  const pokemon = group.basePokemon;
  const name = getDisplayName(pokemon);
  const number = formatPokedexNumber(pokemon.number);
  const total = getTotalStats(pokemon);
  const mainType = pokemon.types[0] || 'normal';
  const config = getTypeConfig(mainType);

  // Use HD official artwork (with fallback for new Legends Z-A Megas)
  const spriteUrl = getSpriteUrl(pokemon);

  // Create type badges using shared components
  const typeBadges = pokemon.types.map(t => TypeBadgeSimple(t)).join('');
  const typeBadgesSmall = pokemon.types.map(t => TypeBadgeTiny(t)).join('');

  // Check if this Pokémon has variants
  const hasVariants = group.variants.length > 0;
  const totalForms = 1 + group.variants.length;

  // Form cycling button (only if has variants) - Frosted glass style
  const formButton = hasVariants ? `
    <button
      class="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md text-gray-600 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white border border-black/10 dark:border-white/20 transition-all"
      data-cycle-form="${pokemon.number}"
    >
      <i data-lucide="layers" class="w-3.5 h-3.5"></i>
      <span class="text-xs font-bold">${totalForms}</span>
    </button>
  ` : '';

  // Calculator button - always shown on left side
  const calcButton = `
    <button
      class="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md text-gray-600 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white border border-black/10 dark:border-white/20 transition-all"
      data-calc-pokemon="${pokemon.number}"
      title="Type Matchups"
    >
      <i data-lucide="calculator" class="w-4 h-4"></i>
    </button>
  `;

  // Build stat bars for back of card
  const statBars = createStatBars(pokemon);

  // Build card HTML with flip structure
  const cardHtml = `
    <div
      class="pokemon-card-container cursor-pointer mt-8"
      style="height: 280px;"
      data-pokemon-number="${pokemon.number}"
      data-form-index="0"
    >
      <div class="pokemon-card-inner">
        <!-- FRONT OF CARD -->
        <div class="pokemon-card-front">
          <div class="group relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-visible h-full">
            <!-- Background type splash -->
            <div
              class="absolute inset-0 rounded-3xl opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"
              style="background-color: ${config.color};"
            ></div>

            ${calcButton}
            ${formButton}

            <!-- Floating sprite -->
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
              <img
                src="${spriteUrl}"
                alt="${name}"
                class="w-full h-full object-contain pokemon-sprite"
                loading="lazy"
                onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png'"
              />
            </div>

            <div class="pt-20 text-center relative z-0">
              <span class="block text-gray-400 font-bold text-xs tracking-widest mb-1 pokemon-number">
                ${number}
              </span>
              <h3 class="text-xl font-black mb-3 text-gray-900 dark:text-white capitalize pokemon-name">
                ${name}
              </h3>

              <div class="flex justify-center gap-2 mb-4 flex-wrap pokemon-types">
                ${typeBadges}
              </div>

              <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 flex justify-between items-center border border-gray-100 dark:border-gray-700">
                <span class="text-xs font-bold text-gray-400 uppercase">Total</span>
                <span class="text-lg font-black pokemon-bst" style="color: ${config.color};">${total}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- BACK OF CARD (Stats) -->
        <div class="pokemon-card-back">
          <div class="relative bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-lg border-2 border-gray-400 dark:border-gray-500 h-full">
            <!-- Background type splash -->
            <div
              class="absolute inset-0 rounded-3xl opacity-5 dark:opacity-10"
              style="background-color: ${config.color};"
            ></div>

            ${hasVariants ? `
            <button
              class="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md text-gray-600 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white border border-black/10 dark:border-white/20 transition-all"
              data-cycle-form="${pokemon.number}"
            >
              <i data-lucide="layers" class="w-3.5 h-3.5"></i>
              <span class="text-xs font-bold">${totalForms}</span>
            </button>
            ` : ''}

            <!-- Header with mini sprite - compact -->
            <div class="flex items-center gap-2 mb-2 relative z-10">
              <img
                src="${spriteUrl}"
                alt="${name}"
                class="w-10 h-10 object-contain pokemon-sprite-back"
              />
              <div>
                <h3 class="text-sm font-black text-gray-900 dark:text-white pokemon-name-back">${name}</h3>
                <div class="flex gap-1 pokemon-types-back">
                  ${typeBadgesSmall}
                </div>
              </div>
            </div>

            <!-- Stat bars - original spacing -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 space-y-2 border border-gray-100 dark:border-gray-700 relative z-10 pokemon-stats">
              ${statBars}
              <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <span class="text-xs font-bold text-gray-400 uppercase">Total</span>
                <span class="text-sm font-black pokemon-bst-back" style="color: ${config.color};">${total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return cardHtml;
}

/**
 * Create stat bars HTML for a Pokémon
 */
export function createStatBars(pokemon: PokemonCreature): string {
  const stats = [
    { label: 'HP', value: pokemon.hp, color: '#ef4444' },
    { label: 'ATK', value: pokemon.attack, color: '#f97316' },
    { label: 'DEF', value: pokemon.defense, color: '#eab308' },
    { label: 'SPA', value: pokemon.spAttack, color: '#3b82f6' },
    { label: 'SPD', value: pokemon.spDefense, color: '#22c55e' },
    { label: 'SPE', value: pokemon.speed, color: '#ec4899' }
  ];

  return stats.map(stat => {
    const percentage = Math.min((stat.value / POKEDEX_CONFIG.MAX_STAT_VALUE) * 100, 100);
    return `
      <div class="flex items-center gap-2 text-xs">
        <span class="w-8 text-gray-500 dark:text-gray-400 font-bold">${stat.label}</span>
        <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full stat-bar-fill rounded-full" style="width: ${percentage}%; background-color: ${stat.color};"></div>
        </div>
        <span class="w-6 text-right font-bold" style="color: ${stat.color};">${stat.value}</span>
      </div>
    `;
  }).join('');
}
