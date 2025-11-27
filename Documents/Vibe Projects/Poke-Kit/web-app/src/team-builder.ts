// team-builder.ts
// Campaign Team Builder - Suggests optimal teams for gym leaders based on available Pokémon

import gamesData from './data/team-builder/games.json';
import bossesData from './data/team-builder/bosses.json';
import progressionData from './data/team-builder/progression.json';
import { loadPokemonData } from './shared/pokemonLoader';
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
const progressionByRegion = progressionData as Record<string, Record<string, ProgressionEntry>>;

// Pokemon data loaded asynchronously
let allPokemon: PokemonCreature[] = [];

// Generation configuration
interface Generation {
  id: number;
  name: string;
  region: string;
}

// Split into two rows for better layout
const generationsRow1: Generation[] = [
  { id: 1, name: 'Gen 1', region: 'Kanto' },
  { id: 2, name: 'Gen 2', region: 'Johto' },
  { id: 3, name: 'Gen 3', region: 'Hoenn' },
  { id: 4, name: 'Gen 4', region: 'Sinnoh' },
  { id: 5, name: 'Gen 5', region: 'Unova' },
];

const generationsRow2: Generation[] = [
  { id: 6, name: 'Gen 6', region: 'Kalos' },
  { id: 7, name: 'Gen 7', region: 'Alola' },
  { id: 8, name: 'Gen 8', region: 'Galar' },
  { id: 9, name: 'Gen 9', region: 'Paldea' },
];

// State
let selectedGen: number = 1;
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
 * Render a single gen pill button
 */
function renderGenPill(gen: Generation): string {
  const isSelected = selectedGen === gen.id;
  const hasGames = Object.values(games).some(g => g.generation === gen.id);

  return `
    <button
      data-gen="${gen.id}"
      class="gen-tab px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
        isSelected
          ? 'bg-red-500 text-white shadow-md'
          : hasGames
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
      }"
      ${!hasGames ? 'disabled title="Coming soon"' : ''}
    >
      ${gen.name}
    </button>
  `;
}

/**
 * Render generation pill tabs in two rows
 */
function renderGenTabs(): string {
  const row1 = generationsRow1.map(renderGenPill).join('');
  const row2 = generationsRow2.map(renderGenPill).join('');

  return `
    <div class="flex gap-2 mb-2">
      ${row1}
    </div>
    <div class="flex gap-2">
      ${row2}
    </div>
  `;
}

/**
 * Render game selection buttons
 */
function renderGameSelector(): string {
  // Filter games by selected generation
  const filteredGames = Object.values(games).filter(g => g.generation === selectedGen);

  const gameButtons = filteredGames.map(game => `
    <button
      data-game="${game.id}"
      class="game-btn flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:scale-105 ${
        selectedGame === game.id
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
      }"
    >
      <img src="${getGameMascot(game.id)}" alt="${game.shortName}" class="w-8 h-8 object-contain" />
      <span class="font-bold text-gray-900 dark:text-white text-xs">${game.shortName}</span>
    </button>
  `).join('');

  // Show message if no games for selected gen
  const noGamesMessage = filteredGames.length === 0
    ? `<p class="text-gray-500 dark:text-gray-400 text-sm italic">No games added yet for this generation.</p>`
    : '';

  return `
    <div class="mb-8">
      <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <i data-lucide="gamepad-2" class="w-5 h-5 text-red-500"></i>
        Select Your Game
      </h2>

      <!-- Gen Pill Tabs (2 rows) -->
      <div class="mb-4">
        ${renderGenTabs()}
      </div>

      <!-- Game Grid -->
      <div class="grid grid-cols-5 gap-2">
        ${gameButtons}
      </div>
      ${noGamesMessage}
    </div>
  `;
}

/**
 * Get mascot artwork for game version
 * Uses classic box art style where available, falls back to official artwork
 */
function getGameMascot(gameId: string): string {
  // Local retro box art (classic Ken Sugimori style)
  // Add more local artwork here as we acquire them
  const localArt: Record<string, string> = {
    red: '/game-icons/charizard-red.png',
  };

  if (localArt[gameId]) {
    return localArt[gameId];
  }

  // Fallback to PokeAPI official artwork - using box mascot Pokemon IDs
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  const mascots: Record<string, number> = {
    // Gen 1
    blue: 9,           // Blastoise
    yellow: 25,        // Pikachu
    // Gen 2
    gold: 250,         // Ho-Oh
    silver: 249,       // Lugia
    crystal: 245,      // Suicune
    // Gen 3
    ruby: 383,         // Groudon
    sapphire: 382,     // Kyogre
    emerald: 384,      // Rayquaza
    firered: 6,        // Charizard
    leafgreen: 3,      // Venusaur
    // Gen 4
    diamond: 483,      // Dialga
    pearl: 484,        // Palkia
    platinum: 487,     // Giratina (Altered)
    heartgold: 250,    // Ho-Oh
    soulsilver: 249,   // Lugia
    // Gen 5
    black: 644,        // Zekrom
    white: 643,        // Reshiram
    black2: 646,       // Kyurem
    white2: 646,       // Kyurem
    // Gen 6
    x: 716,            // Xerneas
    y: 717,            // Yveltal
    omegaruby: 383,    // Groudon (Primal form not in basic artwork)
    alphasapphire: 382,// Kyogre
    // Gen 7
    sun: 791,          // Solgaleo
    moon: 792,         // Lunala
    ultrasun: 800,     // Necrozma
    ultramoon: 800,    // Necrozma
    // Gen 8
    sword: 888,        // Zacian
    shield: 889,       // Zamazenta
    brilliantdiamond: 483, // Dialga
    shiningpearl: 484, // Palkia
    // Gen 9
    scarlet: 1007,     // Koraidon
    violet: 1008       // Miraidon
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

  // Determine sprite generation based on game
  const isGen1Classic = ['red', 'blue', 'yellow'].includes(gameId);
  const isGen1FRLG = ['firered', 'leafgreen'].includes(gameId);
  const isGen2Classic = ['gold', 'silver', 'crystal'].includes(gameId);
  const isGen2HGSS = ['heartgold', 'soulsilver'].includes(gameId);

  // Map boss IDs to Showdown trainer sprite names
  // Format: { gen1classic, gen1frlg, gen2classic, gen2hgss }
  type SpriteMap = { gen1?: string; frlg?: string; gen2?: string; hgss?: string };
  const trainerMap: Record<string, SpriteMap> = {
    // Gen 1 Gym Leaders
    'brock': { gen1: 'brock-gen1', frlg: 'brock-gen3' },
    'misty': { gen1: 'misty-gen1', frlg: 'misty-gen3' },
    'surge': { gen1: 'ltsurge-gen1', frlg: 'ltsurge-gen3' },
    'erika': { gen1: 'erika-gen1', frlg: 'erika-gen3' },
    'koga': { gen1: 'koga-gen1', frlg: 'koga-gen3' },
    'sabrina': { gen1: 'sabrina-gen1', frlg: 'sabrina-gen3' },
    'blaine': { gen1: 'blaine-gen1', frlg: 'blaine-gen3' },
    'giovanni': { gen1: 'giovanni-gen1', frlg: 'giovanni-gen3' },
    // Gen 1 Elite Four
    'lorelei': { gen1: 'lorelei-gen1', frlg: 'lorelei-gen3' },
    'bruno': { gen1: 'bruno-gen1', frlg: 'bruno-gen3' },
    'agatha': { gen1: 'agatha-gen1', frlg: 'agatha-gen3' },
    'lance': { gen1: 'lance-gen1', frlg: 'lance-gen3' },
    'blue-champion': { gen1: 'blue-gen1champion', frlg: 'blue-gen3' },
    // Gen 2 Gym Leaders (Johto)
    'falkner': { gen2: 'falkner-gen2', hgss: 'falkner' },
    'bugsy': { gen2: 'bugsy-gen2', hgss: 'bugsy' },
    'whitney': { gen2: 'whitney-gen2', hgss: 'whitney' },
    'morty': { gen2: 'morty-gen2', hgss: 'morty' },
    'chuck': { gen2: 'chuck-gen2', hgss: 'chuck' },
    'jasmine': { gen2: 'jasmine-gen2', hgss: 'jasmine' },
    'pryce': { gen2: 'pryce-gen2', hgss: 'pryce' },
    'clair': { gen2: 'clair-gen2', hgss: 'clair' },
    // Gen 2 Elite Four (Johto)
    'will': { gen2: 'will-gen2', hgss: 'will' },
    'koga-e4': { gen2: 'koga-gen2', hgss: 'koga' },
    'bruno-e4': { gen2: 'bruno-gen2', hgss: 'bruno' },
    'karen': { gen2: 'karen-gen2', hgss: 'karen' },
    'lance-champion': { gen2: 'lance-gen2', hgss: 'lance' }
  };

  const trainer = trainerMap[bossId];
  if (!trainer) {
    return `${showdownBase}/unknown.png`;
  }

  // Select appropriate sprite based on game version
  let spriteName: string | undefined;
  if (isGen1Classic) {
    spriteName = trainer.gen1;
  } else if (isGen1FRLG) {
    spriteName = trainer.frlg;
  } else if (isGen2Classic) {
    spriteName = trainer.gen2;
  } else if (isGen2HGSS) {
    spriteName = trainer.hgss;
  }

  // Fallback to any available sprite
  if (!spriteName) {
    spriteName = trainer.hgss || trainer.gen2 || trainer.frlg || trainer.gen1 || 'unknown';
  }

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
        <div id="boss-list-gradient" class="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-200/95 via-gray-200/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/40 dark:to-transparent rounded-b-xl transition-opacity duration-300"></div>
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
      <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex flex-col items-center text-center">
        <img
          src="${getSpriteUrl(mon.pokemon)}"
          alt="${mon.pokemon}"
          class="w-14 h-14 object-contain"
          onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'"
        />
        <div class="font-bold text-sm text-gray-900 dark:text-white truncate w-full">${formatPokemonName(mon.pokemon)}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Lv. ${mon.level}</div>
        <div class="flex gap-1 mt-1 flex-wrap justify-center">
          ${types.map(type => `
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${getTypeColor(type)}">
              ${type.toUpperCase()}
            </span>
          `).join('')}
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

  // Get the region for the selected game
  const game = games[selectedGame];
  if (!game) return '';

  const region = game.region; // 'kanto', 'johto', etc.
  const progression = progressionByRegion[region];
  if (!progression) {
    return `
      <div class="card text-center py-8 text-gray-500 dark:text-gray-400">
        <i data-lucide="help-circle" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>Recommended team data coming soon for this region!</p>
      </div>
    `;
  }

  const prog = progression[selectedBoss];
  if (!prog) return '';

  const recommended = prog.recommended[selectedGame] || [];
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

  // Preserve scroll position of boss list before re-render
  const bossList = document.getElementById('boss-list');
  const scrollTop = bossList?.scrollTop || 0;

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

  // Restore scroll position of boss list
  const newBossList = document.getElementById('boss-list');
  if (newBossList && scrollTop > 0) {
    newBossList.scrollTop = scrollTop;
  }

  // Setup scroll-based gradient fade
  setupGradientFade();

  // Attach event listeners
  attachEventListeners();
}

/**
 * Setup gradient fade that hides when scrolled to bottom
 */
function setupGradientFade(): void {
  const bossList = document.getElementById('boss-list');
  const gradient = document.getElementById('boss-list-gradient');

  if (!bossList || !gradient) return;

  const updateGradient = () => {
    const isAtBottom = bossList.scrollHeight - bossList.scrollTop - bossList.clientHeight < 10;
    gradient.style.opacity = isAtBottom ? '0' : '1';
  };

  // Initial check
  updateGradient();

  // Update on scroll
  bossList.addEventListener('scroll', updateGradient);
}

/**
 * Attach event listeners for gen tabs, game and boss selection
 */
function attachEventListeners(): void {
  // Generation tab buttons
  document.querySelectorAll('.gen-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const gen = parseInt(btn.getAttribute('data-gen') || '1', 10);
      if (gen !== selectedGen) {
        selectedGen = gen;
        selectedGame = null; // Reset game selection when gen changes
        selectedBoss = null; // Reset boss selection too
        render();
      }
    });
  });

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
export async function initTeamBuilder(): Promise<void> {
  const container = document.getElementById('team-builder-content');

  // Show loading state
  if (container) {
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="spinner mr-3"></div>
        <span class="text-gray-500">Loading Pokémon data...</span>
      </div>
    `;
  }

  try {
    // Load Pokemon data asynchronously
    allPokemon = await loadPokemonData();
    render();
  } catch (error) {
    console.error('Failed to load Pokemon data:', error);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <p class="text-red-500 font-bold">Failed to load Pokémon data</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Retry
          </button>
        </div>
      `;
    }
  }
}

/**
 * Cleanup (if needed)
 */
export function cleanupTeamBuilder(): void {
  selectedGame = null;
  selectedBoss = null;
}
