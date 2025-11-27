// pokedex/matchupModal.ts
// Handles the type matchup modal - shows defensive type effectiveness

import type { PokemonCreature, PokemonType, DefensiveProfile } from '../types/pokemon';
import { getDisplayName, toTitleCaseType } from '../types/pokemon';
import { getTypeConfig } from '../shared/typeConfig';
import { TypeBadgeSimple } from '../shared/components';
import { getSpriteUrl } from '../shared/pokemonLoader';
import { getFullDefensiveProfile } from '../data/typeChart';

// Declare lucide global (loaded via CDN)
declare const lucide: {
  createIcons: () => void;
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Open the type matchup modal for a Pokémon
 */
export function openMatchupModal(pokemon: PokemonCreature): void {
  // Get or create modal
  let modal = document.getElementById('matchup-modal');
  if (!modal) {
    modal = createMatchupModal();
    document.body.appendChild(modal);
  }

  // Update modal content
  const spriteUrl = getSpriteUrl(pokemon);
  const name = getDisplayName(pokemon);
  const mainType = pokemon.types[0] || 'normal';
  const config = getTypeConfig(mainType);

  // Set sprite
  const spriteEl = document.getElementById('matchup-modal-sprite') as HTMLImageElement;
  if (spriteEl) spriteEl.src = spriteUrl;

  // Set name
  const nameEl = document.getElementById('matchup-modal-name');
  if (nameEl) nameEl.textContent = name;

  // Set type badges
  const typesEl = document.getElementById('matchup-modal-types');
  if (typesEl) {
    typesEl.innerHTML = pokemon.types.map(t => TypeBadgeSimple(t)).join('');
  }

  // Set background color
  const bgEl = document.getElementById('matchup-modal-bg-color');
  if (bgEl) bgEl.style.backgroundColor = config.color;

  // Calculate and render matchups
  const type1 = toTitleCaseType(pokemon.types[0]) as PokemonType;
  const type2 = pokemon.types[1] ? toTitleCaseType(pokemon.types[1]) as PokemonType : null;
  const profile = getFullDefensiveProfile(type1, type2);
  renderMatchups(profile);

  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Add escape key listener
  document.addEventListener('keydown', handleMatchupModalKeydown);

  // Initialize icons
  lucide.createIcons();
}

/**
 * Close the type matchup modal
 */
export function closeMatchupModal(): void {
  const modal = document.getElementById('matchup-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  document.removeEventListener('keydown', handleMatchupModalKeydown);
}

// ============================================================================
// MODAL CREATION
// ============================================================================

/**
 * Handle keydown events for matchup modal
 */
function handleMatchupModalKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeMatchupModal();
  }
}

/**
 * Create the matchup modal element (same design as moveset modal)
 */
function createMatchupModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.id = 'matchup-modal';
  modal.className = 'fixed inset-0 z-50 hidden items-center justify-center p-4 moveset-modal-backdrop';

  modal.innerHTML = `
    <div class="moveset-modal-content rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col modal-animate overflow-hidden" onclick="event.stopPropagation()">
      <!-- Modal Header -->
      <div class="relative p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 overflow-hidden">
        <div class="absolute inset-0 opacity-5 dark:opacity-10" id="matchup-modal-bg-color" style="background-color: #EE8130;"></div>
        <div class="relative flex items-center gap-4">
          <img id="matchup-modal-sprite" src="" alt="" class="w-20 h-20 object-contain" />
          <div>
            <h2 id="matchup-modal-name" class="text-2xl font-black text-gray-900 dark:text-white">Pokémon</h2>
            <div id="matchup-modal-types" class="flex gap-2 mt-1"></div>
          </div>
          <button onclick="window.closeMatchupModal?.()" class="absolute top-0 right-0 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
      </div>

      <!-- Matchup Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" id="matchup-content">
        <!-- Matchups will be loaded here -->
      </div>
    </div>
  `;

  // Close on backdrop click
  modal.addEventListener('click', closeMatchupModal);

  // Expose close function globally for onclick
  (window as { closeMatchupModal?: () => void }).closeMatchupModal = closeMatchupModal;

  return modal;
}

// ============================================================================
// MATCHUP RENDERING
// ============================================================================

/**
 * Render type matchups in the modal
 */
function renderMatchups(profile: DefensiveProfile): void {
  const content = document.getElementById('matchup-content');
  if (!content) return;

  const { matchups } = profile;

  // Group by multiplier
  const weaknesses4x: string[] = [];
  const weaknesses2x: string[] = [];
  const resistances05x: string[] = [];
  const resistances025x: string[] = [];
  const immunities: string[] = [];

  matchups.forEach(m => {
    if (m.mult === 4) weaknesses4x.push(m.attacker);
    else if (m.mult === 2) weaknesses2x.push(m.attacker);
    else if (m.mult === 0.5) resistances05x.push(m.attacker);
    else if (m.mult === 0.25) resistances025x.push(m.attacker);
    else if (m.mult === 0) immunities.push(m.attacker);
  });

  let html = '';

  // Weaknesses (4x)
  if (weaknesses4x.length > 0) {
    html += renderMatchupSection('Super Weak (4×)', weaknesses4x, 'text-red-600 dark:text-red-400');
  }

  // Weaknesses (2x)
  if (weaknesses2x.length > 0) {
    html += renderMatchupSection('Weak (2×)', weaknesses2x, 'text-orange-600 dark:text-orange-400');
  }

  // Resistances (0.5x)
  if (resistances05x.length > 0) {
    html += renderMatchupSection('Resistant (0.5×)', resistances05x, 'text-green-600 dark:text-green-400');
  }

  // Resistances (0.25x)
  if (resistances025x.length > 0) {
    html += renderMatchupSection('Super Resistant (0.25×)', resistances025x, 'text-teal-600 dark:text-teal-400');
  }

  // Immunities
  if (immunities.length > 0) {
    html += renderMatchupSection('Immune (0×)', immunities, 'text-purple-600 dark:text-purple-400');
  }

  content.innerHTML = html;
}

/**
 * Render a matchup section with type badges (with watermark icons)
 */
function renderMatchupSection(title: string, types: string[], titleColorClass: string): string {
  const typeBadges = types.map(type => {
    const config = getTypeConfig(type.toLowerCase());
    return `
      <span class="relative px-3 py-1.5 rounded-lg text-sm font-bold text-white overflow-hidden" style="background-color: ${config.color};">
        <img src="${config.icon}" alt="" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none" style="height: 140%;" />
        <span class="relative z-10">${config.label}</span>
      </span>
    `;
  }).join('');

  return `
    <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <h3 class="text-sm font-bold uppercase tracking-wider mb-3 ${titleColorClass}">${title}</h3>
      <div class="flex flex-wrap gap-2">
        ${typeBadges}
      </div>
    </div>
  `;
}
