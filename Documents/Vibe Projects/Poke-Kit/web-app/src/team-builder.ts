// team-builder.ts
// Campaign Team Builder - Suggests optimal teams for gym leaders based on available Pokémon

import gamesData from './data/team-builder/games.json';
import bossesData from './data/team-builder/bosses.json';
import progressionData from './data/team-builder/progression.json';
import pokemonData from './data/pokemon.json';
// Type colors defined locally to avoid import issues
import { getDisplayName } from './types/pokemon';
import type { PokemonCreature } from './types/pokemon';

// Type definitions
interface Game {
  id: string;
  name: string;
  shortName: string;
  generation: number;
  region: string;
  gyms: string[];
  eliteFour: string[];
  champion: string;
}

interface BossPokemon {
  pokemon: string;
  level: number;
  moves: string[];
}

interface Boss {
  id: string;
  name: string;
  title: string;
  type: string;
  specialty: string[];
  badge?: string;
  location: string;
  order: number;
  teams: Record<string, BossPokemon[]>;
  weaknesses: string[];
  difficulty: string;
  tips: string;
}

interface ProgressionEntry {
  description: string;
  locations: string[];
  pokemon: Record<string, { starter?: string[]; wild?: string[]; new?: string[]; gift?: string[] }>;
  recommended: Record<string, string[]>;
  special?: Record<string, string>;
}

// Cast imported data
const games = gamesData as Record<string, Game>;
const bosses = bossesData as Record<string, Boss>;
const progression = (progressionData as { kanto: Record<string, ProgressionEntry> }).kanto;
const allPokemon = pokemonData as PokemonCreature[];

// State
let selectedGame: string | null = null;
let selectedBoss: string | null = null;

/**
 * Get Pokemon creature data by name
 */
function getPokemonByName(name: string): PokemonCreature | undefined {
  return allPokemon.find(p => p.name === name || p.name === name.toLowerCase());
}

/**
 * Get sprite URL for a Pokemon
 */
function getSpriteUrl(pokemonName: string): string {
  const pokemon = getPokemonByName(pokemonName);
  if (pokemon) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.number}.png`;
  }
  // Fallback to name-based lookup
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png`;
}

/**
 * Format Pokemon name for display
 */
function formatPokemonName(name: string): string {
  const pokemon = getPokemonByName(name);
  if (pokemon) {
    return getDisplayName(pokemon);
  }
  // Fallback formatting
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Get Tailwind background color class for a type
 */
function getTypeColor(type: string): string {
  const typeColorMap: Record<string, string> = {
    normal: 'bg-[#A8A77A]',
    fire: 'bg-[#EE8130]',
    water: 'bg-[#6390F0]',
    electric: 'bg-[#F7D02C]',
    grass: 'bg-[#7AC74C]',
    ice: 'bg-[#96D9D6]',
    fighting: 'bg-[#C22E28]',
    poison: 'bg-[#A33EA1]',
    ground: 'bg-[#E2BF65]',
    flying: 'bg-[#A98FF3]',
    psychic: 'bg-[#F95587]',
    bug: 'bg-[#A6B91A]',
    rock: 'bg-[#B6A136]',
    ghost: 'bg-[#735797]',
    dragon: 'bg-[#6F35FC]',
    dark: 'bg-[#705746]',
    steel: 'bg-[#B7B7CE]',
    fairy: 'bg-[#D685AD]',
    mixed: 'bg-gray-500'
  };
  return typeColorMap[type.toLowerCase()] || 'bg-gray-500';
}

/**
 * Render game selection buttons
 */
function renderGameSelector(): string {
  const gameButtons = Object.values(games).map(game => `
    <button
      data-game="${game.id}"
      class="game-btn flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105 ${
        selectedGame === game.id
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
      }"
    >
      <img src="${getGameMascot(game.id)}" alt="${game.shortName}" class="w-12 h-12 mb-1 object-contain drop-shadow-md" />
      <span class="font-bold text-gray-900 dark:text-white text-sm">${game.shortName}</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">Gen ${game.generation}</span>
    </button>
  `).join('');

  return `
    <div class="mb-8">
      <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <i data-lucide="gamepad-2" class="w-5 h-5 text-red-500"></i>
        Select Your Game
      </h2>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
        ${gameButtons}
      </div>
    </div>
  `;
}

/**
 * Get mascot artwork for game version
 * Uses classic box art style where available, falls back to official artwork
 */
function getGameMascot(gameId: string): string {
  // Local retro box art (classic Ken Sugimori style)
  const localArt: Record<string, string> = {
    red: '/game-icons/charizard-red.png',
  };

  if (localArt[gameId]) {
    return localArt[gameId];
  }

  // Fallback to PokeAPI official artwork
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  const mascots: Record<string, number> = {
    blue: 9,       // Blastoise
    yellow: 25,    // Pikachu
    firered: 6,    // Charizard
    leafgreen: 3   // Venusaur
  };
  const pokemonId = mascots[gameId] || 25;
  return `${baseUrl}/${pokemonId}.png`;
}

/**
 * Get trainer sprite URL based on game version
 * Uses Pokémon Showdown sprites which have good quality trainer images
 */
function getTrainerSpriteUrl(bossId: string, gameId: string): string {
  // Showdown trainer sprite base URL
  const showdownBase = 'https://play.pokemonshowdown.com/sprites/trainers';

  // FireRed/LeafGreen use FRLG sprites, others use classic sprites
  const isFRLG = gameId === 'firered' || gameId === 'leafgreen';

  // Map boss IDs to Showdown trainer sprite names
  const trainerMap: Record<string, { classic: string; frlg: string }> = {
    'brock': { classic: 'brock-gen1', frlg: 'brock-gen3' },
    'misty': { classic: 'misty-gen1', frlg: 'misty-gen3' },
    'surge': { classic: 'ltsurge-gen1', frlg: 'ltsurge-gen3' },
    'erika': { classic: 'erika-gen1', frlg: 'erika-gen3' },
    'koga': { classic: 'koga-gen1', frlg: 'koga-gen3' },
    'sabrina': { classic: 'sabrina-gen1', frlg: 'sabrina-gen3' },
    'blaine': { classic: 'blaine-gen1', frlg: 'blaine-gen3' },
    'giovanni': { classic: 'giovanni-gen1', frlg: 'giovanni-gen3' },
    'lorelei': { classic: 'lorelei-gen1', frlg: 'lorelei-gen3' },
    'bruno': { classic: 'bruno-gen1', frlg: 'bruno-gen3' },
    'agatha': { classic: 'agatha-gen1', frlg: 'agatha-gen3' },
    'lance': { classic: 'lance-gen1', frlg: 'lance-gen3' },
    'blue-champion': { classic: 'blue-gen1champion', frlg: 'blue-gen3' }
  };

  const trainer = trainerMap[bossId];
  if (!trainer) {
    return `${showdownBase}/unknown.png`;
  }

  const spriteName = isFRLG ? trainer.frlg : trainer.classic;
  return `${showdownBase}/${spriteName}.png`;
}

/**
 * Render boss selection list
 */
function renderBossSelector(): string {
  if (!selectedGame) {
    return `
      <div class="card text-center py-8 text-gray-500 dark:text-gray-400">
        <i data-lucide="arrow-up" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>Select a game first to see available battles</p>
      </div>
    `;
  }

  const gameId = selectedGame; // TypeScript narrowing
  const game = games[gameId];
  const allBosses = [...game.gyms, ...game.eliteFour, game.champion];

  const bossButtons = allBosses.map(bossId => {
    const boss = bosses[bossId];
    if (!boss) return '';

    const isSelected = selectedBoss === bossId;
    const spriteUrl = getTrainerSpriteUrl(bossId, gameId);

    return `
      <button
        data-boss="${bossId}"
        class="boss-btn flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] text-left ${
          isSelected
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
        }"
      >
        <img
          src="${spriteUrl}"
          alt="${boss.name}"
          class="w-16 h-16 object-contain pixelated"
          onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden')"
        />
        <span class="hidden w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">${boss.order}</span>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-gray-900 dark:text-white truncate">${boss.name}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${boss.title}</div>
        </div>
        <div class="flex gap-1">
          ${boss.specialty.map(type => `
            <span class="px-2 py-0.5 rounded text-xs font-bold text-white ${getTypeColor(type)}">
              ${type.toUpperCase()}
            </span>
          `).join('')}
        </div>
      </button>
    `;
  }).join('');

  return `
    <div class="mb-8">
      <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <i data-lucide="swords" class="w-5 h-5 text-red-500"></i>
        Select Battle
      </h2>
      <div class="relative">
        <div class="grid gap-2 max-h-[750px] overflow-y-auto scrollbar-hide px-2 py-1" id="boss-list">
          ${bossButtons}
        </div>
        <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-200/95 via-gray-200/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/40 dark:to-transparent rounded-b-xl"></div>
      </div>
    </div>
  `;
}

/**
 * Render boss details and team
 */
function renderBossDetails(): string {
  if (!selectedGame || !selectedBoss) {
    return '';
  }

  const boss = bosses[selectedBoss];
  if (!boss) return '';

  // Get team for selected game (handle champion's starter-based teams)
  const gameId = selectedGame; // Already checked for null above
  let team: BossPokemon[] = [];
  if (boss.teams[gameId]) {
    team = boss.teams[gameId];
  } else if (selectedBoss === 'blue-champion') {
    // For champion, default to showing one variant
    const variants = Object.keys(boss.teams).filter(k => k.startsWith(gameId));
    if (variants.length > 0) {
      team = boss.teams[variants[0]];
    }
  }

  const teamCards = team.map(mon => {
    const pokemon = getPokemonByName(mon.pokemon);
    const types = pokemon?.types || [];

    return `
      <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3">
        <img
          src="${getSpriteUrl(mon.pokemon)}"
          alt="${mon.pokemon}"
          class="w-16 h-16 object-contain"
          onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'"
        />
        <div class="flex-1 min-w-0">
          <div class="font-bold text-gray-900 dark:text-white">${formatPokemonName(mon.pokemon)}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Lv. ${mon.level}</div>
          <div class="flex gap-1 mt-1">
            ${types.map(type => `
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${getTypeColor(type)}">
                ${type.toUpperCase()}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const weaknessChips = boss.weaknesses.map(type => `
    <span class="px-2 py-1 rounded-lg text-xs font-bold text-white ${getTypeColor(type)}">
      ${type.toUpperCase()}
    </span>
  `).join('');

  return `
    <div class="card mb-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">${boss.name}'s Team</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">${boss.location}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${
          boss.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
          boss.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
          boss.difficulty === 'hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }">
          ${boss.difficulty.toUpperCase()}
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        ${teamCards}
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div class="mb-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Weak to:</span>
          <div class="flex flex-wrap gap-1 mt-1">${weaknessChips}</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <i data-lucide="lightbulb" class="w-4 h-4 inline mr-1"></i>
            <strong>Tip:</strong> ${boss.tips}
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render recommended team
 */
function renderRecommendedTeam(): string {
  if (!selectedGame || !selectedBoss) {
    return '';
  }

  const bossKey = selectedBoss as keyof typeof progression;
  const prog = progression[bossKey];
  if (!prog) return '';

  const gameKey = selectedGame as keyof typeof prog.recommended;
  const recommended = prog.recommended[gameKey] || [];
  if (recommended.length === 0) {
    return `
      <div class="card text-center py-8 text-gray-500 dark:text-gray-400">
        <i data-lucide="help-circle" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>No specific recommendations available</p>
      </div>
    `;
  }

  // Get special notes for this boss
  const specialNotes = prog.special || {};

  const recommendedCards = recommended.slice(0, 6).map(pokemonName => {
    const pokemon = getPokemonByName(pokemonName);
    const types = pokemon?.types || [];
    const hasSpecialNote = specialNotes[pokemonName];

    return `
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800 relative group">
        ${hasSpecialNote ? `
          <span class="absolute top-2 right-2 text-amber-500 font-bold text-lg cursor-help" title="${hasSpecialNote}">*</span>
        ` : ''}
        <img
          src="${getSpriteUrl(pokemonName)}"
          alt="${pokemonName}"
          class="w-20 h-20 mx-auto object-contain mb-2"
          onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'"
        />
        <div class="font-bold text-gray-900 dark:text-white text-sm">${formatPokemonName(pokemonName)}${hasSpecialNote ? '<span class="text-amber-500">*</span>' : ''}</div>
        <div class="flex justify-center gap-1 mt-1">
          ${types.map(type => `
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${getTypeColor(type)}">
              ${type.toUpperCase()}
            </span>
          `).join('')}
        </div>
        ${hasSpecialNote ? `
          <div class="mt-2 text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
            ${hasSpecialNote}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Check if any recommendations have special notes
  const hasAnySpecialNotes = recommended.some(name => specialNotes[name]);

  return `
    <div class="card">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <i data-lucide="star" class="w-5 h-5 text-yellow-500"></i>
        Recommended Pokémon
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        These Pokémon are available before this battle and counter the boss${hasAnySpecialNotes ? ' (<span class="text-amber-500 font-bold">*</span> = via specific move)' : ''}:
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        ${recommendedCards}
      </div>
    </div>
  `;
}

/**
 * Render the full Team Builder UI
 */
function render(): void {
  const container = document.getElementById('team-builder-content');
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- Left Column: Selection -->
      <div class="lg:sticky lg:top-20">
        ${renderGameSelector()}
        ${renderBossSelector()}
      </div>

      <!-- Right Column: Details -->
      <div>
        ${renderBossDetails()}
        ${renderRecommendedTeam()}
      </div>
    </div>
  `;

  // Re-create Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Attach event listeners
  attachEventListeners();
}

/**
 * Attach event listeners for game and boss selection
 */
function attachEventListeners(): void {
  // Game selection buttons
  document.querySelectorAll('.game-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGame = btn.getAttribute('data-game');
      selectedBoss = null; // Reset boss selection when game changes
      render();
    });
  });

  // Boss selection buttons
  document.querySelectorAll('.boss-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBoss = btn.getAttribute('data-boss');
      render();
    });
  });

}

// Declare lucide global
declare const lucide: { createIcons: () => void };

/**
 * Initialize the Team Builder
 */
export function initTeamBuilder(): void {
  render();
}

/**
 * Cleanup (if needed)
 */
export function cleanupTeamBuilder(): void {
  selectedGame = null;
  selectedBoss = null;
}
