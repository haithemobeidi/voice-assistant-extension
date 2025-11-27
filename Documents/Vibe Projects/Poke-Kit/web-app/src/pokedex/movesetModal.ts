// pokedex/movesetModal.ts
// Handles the moveset modal functionality - fetching moves from PokeAPI and displaying them

import type { PokemonCreature } from '../types/pokemon';
import { getDisplayName } from '../types/pokemon';
import { getTypeConfig } from '../shared/typeConfig';
import { TypeBadgeSimple } from '../shared/components';
import { getSpriteUrl } from '../shared/pokemonLoader';

// Declare lucide global (loaded via CDN)
declare const lucide: {
  createIcons: () => void;
};

// ============================================================================
// TYPES
// ============================================================================

interface MoveData {
  name: string;
  type: string;
  learnMethod: string;
  level?: number;
  machine?: string;
  url?: string;
}

interface MovesByGen {
  [gen: string]: MoveData[];
}

// ============================================================================
// STATE
// ============================================================================

let currentMovesetPokemon: PokemonCreature | null = null;

// Cache for fetched move data
const moveCache = new Map<string, MovesByGen>();

// Cache for move type lookups (move name -> type)
const moveTypeCache = new Map<string, string>();

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Open the moveset modal for a Pokémon
 */
export async function openMovesetModal(pokemon: PokemonCreature): Promise<void> {
  currentMovesetPokemon = pokemon;

  // Create modal if doesn't exist
  let modal = document.getElementById('moveset-modal');
  if (!modal) {
    modal = createMovesetModal();
    document.body.appendChild(modal);
  }

  // Update modal header
  const name = getDisplayName(pokemon);
  const spriteUrl = getSpriteUrl(pokemon);
  const mainType = pokemon.types[0] || 'normal';
  const config = getTypeConfig(mainType);

  const modalSprite = document.getElementById('moveset-modal-sprite') as HTMLImageElement;
  const modalName = document.getElementById('moveset-modal-name');
  const modalTypes = document.getElementById('moveset-modal-types');
  const modalBgColor = document.getElementById('moveset-modal-bg-color');

  if (modalSprite) modalSprite.src = spriteUrl;
  if (modalName) modalName.textContent = name;
  if (modalTypes) modalTypes.innerHTML = pokemon.types.map(t => TypeBadgeSimple(t)).join('');
  if (modalBgColor) modalBgColor.style.backgroundColor = config.color;

  // Show modal
  modal.classList.remove('hidden');

  // Show loading state
  const moveList = document.getElementById('moveset-move-list');
  if (moveList) {
    moveList.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="spinner mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">Loading moves...</p>
      </div>
    `;
  }

  // Fetch and display moves
  try {
    const moves = await fetchPokemonMoves(pokemon);
    renderMoves(moves, 'gen1');
  } catch (error) {
    console.error('Failed to fetch moves:', error);
    if (moveList) {
      moveList.innerHTML = `
        <div class="text-center py-12">
          <p class="text-red-500 font-bold">Failed to load moves</p>
          <p class="text-gray-500 text-sm mt-2">Please try again later</p>
        </div>
      `;
    }
  }

  // Add escape key listener
  document.addEventListener('keydown', handleModalKeydown);
  lucide.createIcons();
}

/**
 * Close the moveset modal
 */
export function closeMovesetModal(): void {
  const modal = document.getElementById('moveset-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentMovesetPokemon = null;
  document.removeEventListener('keydown', handleModalKeydown);
}

// ============================================================================
// MODAL CREATION
// ============================================================================

/**
 * Handle keydown events for modal
 */
function handleModalKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeMovesetModal();
  }
}

/**
 * Create the moveset modal HTML structure
 */
function createMovesetModal(): HTMLElement {
  const modal = document.createElement('div');
  modal.id = 'moveset-modal';
  modal.className = 'fixed inset-0 z-50 hidden';
  modal.innerHTML = `
    <div class="moveset-modal-backdrop absolute inset-0" onclick="window.closeMovesetModal?.()"></div>
    <div class="absolute inset-4 md:inset-8 lg:inset-16 flex items-center justify-center pointer-events-none">
      <div class="moveset-modal-content modal-animate rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl max-h-full overflow-hidden pointer-events-auto flex flex-col">

        <!-- Modal Header -->
        <div class="relative p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div class="absolute inset-0 opacity-5 dark:opacity-10" id="moveset-modal-bg-color" style="background-color: #EE8130;"></div>
          <div class="relative flex items-center gap-4">
            <img id="moveset-modal-sprite" src="" alt="" class="w-20 h-20 object-contain" />
            <div>
              <h2 id="moveset-modal-name" class="text-2xl font-black text-gray-900 dark:text-white">Pokémon</h2>
              <div id="moveset-modal-types" class="flex gap-2 mt-1"></div>
            </div>
            <button onclick="window.closeMovesetModal?.()" class="absolute top-0 right-0 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>
        </div>

        <!-- Generation Tabs -->
        <div class="flex gap-2 p-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto flex-shrink-0" id="moveset-gen-tabs">
          <button class="gen-tab active px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white" data-gen="gen1">Gen 1</button>
          <button class="gen-tab px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" data-gen="gen2">Gen 2</button>
          <button class="gen-tab px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" data-gen="gen3">Gen 3</button>
          <button class="gen-tab px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" data-gen="gen4">Gen 4</button>
          <button class="gen-tab px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" data-gen="gen5plus">Gen 5+</button>
        </div>

        <!-- Move List -->
        <div class="flex-1 overflow-y-auto p-4" id="moveset-move-list">
          <!-- Moves will be loaded here -->
        </div>
      </div>
    </div>
  `;

  // Attach tab click listeners
  setTimeout(() => {
    document.querySelectorAll('#moveset-gen-tabs .gen-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const gen = tab.getAttribute('data-gen') || 'gen1';
        switchGenTab(gen);
      });
    });
  }, 0);

  // Expose close function globally for onclick
  (window as { closeMovesetModal?: () => void }).closeMovesetModal = closeMovesetModal;

  return modal;
}

// ============================================================================
// TAB SWITCHING
// ============================================================================

/**
 * Switch active generation tab
 */
function switchGenTab(gen: string): void {
  // Update tab styling
  document.querySelectorAll('#moveset-gen-tabs .gen-tab').forEach(tab => {
    const tabGen = tab.getAttribute('data-gen');
    if (tabGen === gen) {
      tab.classList.add('active', 'bg-red-600', 'text-white');
      tab.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-300');
    } else {
      tab.classList.remove('active', 'bg-red-600', 'text-white');
      tab.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-300');
    }
  });

  // Re-render moves for this gen with fade transition
  if (currentMovesetPokemon) {
    const cacheKey = getCacheKey(currentMovesetPokemon);
    const cachedMoves = moveCache.get(cacheKey);
    if (cachedMoves) {
      const moveList = document.getElementById('moveset-move-list');
      if (moveList) {
        // Fade out, switch content, fade in
        moveList.classList.add('switching');
        setTimeout(() => {
          renderMoves(cachedMoves, gen);
          moveList.classList.remove('switching');
        }, 150);
      } else {
        renderMoves(cachedMoves, gen);
      }
    }
  }
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Get cache key for a Pokémon
 */
function getCacheKey(pokemon: PokemonCreature): string {
  return pokemon.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

/**
 * Fetch moves for a Pokémon from PokéAPI
 */
async function fetchPokemonMoves(pokemon: PokemonCreature): Promise<MovesByGen> {
  const cacheKey = getCacheKey(pokemon);

  // Check cache first
  if (moveCache.has(cacheKey)) {
    return moveCache.get(cacheKey)!;
  }

  // Fetch from PokéAPI
  const apiName = pokemon.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);

  if (!response.ok) {
    // Try with just the number for variants
    const numResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.number}`);
    if (!numResponse.ok) {
      throw new Error('Failed to fetch Pokémon data');
    }
    return processPokeApiResponse(await numResponse.json());
  }

  const data = await response.json();
  const moves = processPokeApiResponse(data);

  // Cache the result
  moveCache.set(cacheKey, moves);
  return moves;
}

/**
 * Process PokéAPI response into organized moves by generation
 */
function processPokeApiResponse(data: {
  moves: Array<{
    move: { name: string; url: string };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: { name: string };
      version_group: { name: string };
    }>;
  }>;
}): MovesByGen {
  const movesByGen: MovesByGen = {
    gen1: [],
    gen2: [],
    gen3: [],
    gen4: [],
    gen5plus: []
  };

  // Map version groups to generations
  const genMap: Record<string, string> = {
    'red-blue': 'gen1',
    'yellow': 'gen1',
    'gold-silver': 'gen2',
    'crystal': 'gen2',
    'ruby-sapphire': 'gen3',
    'emerald': 'gen3',
    'firered-leafgreen': 'gen3',
    'diamond-pearl': 'gen4',
    'platinum': 'gen4',
    'heartgold-soulsilver': 'gen4',
    'black-white': 'gen5plus',
    'black-2-white-2': 'gen5plus',
    'x-y': 'gen5plus',
    'omega-ruby-alpha-sapphire': 'gen5plus',
    'sun-moon': 'gen5plus',
    'ultra-sun-ultra-moon': 'gen5plus',
    'lets-go-pikachu-lets-go-eevee': 'gen5plus',
    'sword-shield': 'gen5plus',
    'brilliant-diamond-and-shining-pearl': 'gen5plus',
    'legends-arceus': 'gen5plus',
    'scarlet-violet': 'gen5plus'
  };

  // Track which moves we've added to each gen to avoid duplicates
  const addedMoves: Record<string, Set<string>> = {
    gen1: new Set(),
    gen2: new Set(),
    gen3: new Set(),
    gen4: new Set(),
    gen5plus: new Set()
  };

  data.moves.forEach(moveEntry => {
    const moveName = moveEntry.move.name.replace(/-/g, ' ');
    const moveUrl = moveEntry.move.url;

    moveEntry.version_group_details.forEach(detail => {
      const gen = genMap[detail.version_group.name];
      if (!gen) return;

      const moveKey = `${moveName}-${detail.move_learn_method.name}-${detail.level_learned_at}`;
      if (addedMoves[gen].has(moveKey)) return;
      addedMoves[gen].add(moveKey);

      const moveData: MoveData = {
        name: moveName,
        type: 'normal', // Will be fetched lazily
        learnMethod: detail.move_learn_method.name,
        url: moveUrl
      };

      if (detail.move_learn_method.name === 'level-up') {
        moveData.level = detail.level_learned_at;
      } else if (detail.move_learn_method.name === 'machine') {
        moveData.machine = 'TM';
      }

      movesByGen[gen].push(moveData);
    });
  });

  // Sort moves within each gen
  Object.keys(movesByGen).forEach(gen => {
    movesByGen[gen].sort((a, b) => {
      // Level-up moves first, sorted by level
      if (a.learnMethod === 'level-up' && b.learnMethod !== 'level-up') return -1;
      if (b.learnMethod === 'level-up' && a.learnMethod !== 'level-up') return 1;
      if (a.learnMethod === 'level-up' && b.learnMethod === 'level-up') {
        return (a.level || 0) - (b.level || 0);
      }
      // Then machines
      if (a.learnMethod === 'machine' && b.learnMethod !== 'machine') return -1;
      if (b.learnMethod === 'machine' && a.learnMethod !== 'machine') return 1;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  });

  return movesByGen;
}

// ============================================================================
// MOVE RENDERING
// ============================================================================

/**
 * Render moves for a specific generation
 */
async function renderMoves(movesByGen: MovesByGen, gen: string): Promise<void> {
  const moveList = document.getElementById('moveset-move-list');
  if (!moveList) return;

  const moves = movesByGen[gen] || [];

  if (moves.length === 0) {
    moveList.innerHTML = `
      <div class="text-center py-12">
        <i data-lucide="file-x" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400">No moves available for this generation.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Show initial render with loading indicator for types
  renderMovesHTML(moves, moveList);

  // Fetch move types in background and update
  await fetchAndUpdateMoveTypes(moves, gen);
}

/**
 * Render the HTML for moves (called initially and after type fetch)
 */
function renderMovesHTML(moves: MoveData[], moveList: HTMLElement): void {
  // Group moves by learn method
  const levelUpMoves = moves.filter(m => m.learnMethod === 'level-up');
  const machineMoves = moves.filter(m => m.learnMethod === 'machine');
  const otherMoves = moves.filter(m => m.learnMethod !== 'level-up' && m.learnMethod !== 'machine');

  let html = '';

  // Level Up Moves
  if (levelUpMoves.length > 0) {
    html += `
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i data-lucide="trending-up" class="w-4 h-4 text-purple-500"></i>
          Level Up (${levelUpMoves.length})
        </h3>
        <div class="space-y-2">
          ${levelUpMoves.map(move => renderMoveItem(move, 'level')).join('')}
        </div>
      </div>
    `;
  }

  // TM/HM Moves
  if (machineMoves.length > 0) {
    html += `
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i data-lucide="disc" class="w-4 h-4 text-blue-500"></i>
          TM / HM (${machineMoves.length})
        </h3>
        <div class="space-y-2">
          ${machineMoves.map(move => renderMoveItem(move, 'machine')).join('')}
        </div>
      </div>
    `;
  }

  // Other Moves (tutor, egg, etc.)
  if (otherMoves.length > 0) {
    html += `
      <div class="mb-6">
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4 text-green-500"></i>
          Other (${otherMoves.length})
        </h3>
        <div class="space-y-2">
          ${otherMoves.map(move => renderMoveItem(move, 'other')).join('')}
        </div>
      </div>
    `;
  }

  moveList.innerHTML = html;
  lucide.createIcons();
}

/**
 * Fetch move types from PokéAPI and update the display
 */
async function fetchAndUpdateMoveTypes(moves: MoveData[], _gen: string): Promise<void> {
  // Get unique moves that need type fetching
  const movesToFetch = moves.filter(m => m.type === 'normal' && m.url && !moveTypeCache.has(m.name));

  if (movesToFetch.length === 0) {
    // All types already cached, just update from cache
    moves.forEach(m => {
      if (moveTypeCache.has(m.name)) {
        m.type = moveTypeCache.get(m.name)!;
      }
    });
    const moveList = document.getElementById('moveset-move-list');
    if (moveList) renderMovesHTML(moves, moveList);
    return;
  }

  // Fetch move types in batches (limit concurrent requests)
  const BATCH_SIZE = 10;
  for (let i = 0; i < movesToFetch.length; i += BATCH_SIZE) {
    const batch = movesToFetch.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (move) => {
      try {
        if (move.url) {
          const response = await fetch(move.url);
          if (response.ok) {
            const data = await response.json();
            const moveType = data.type?.name || 'normal';
            moveTypeCache.set(move.name, moveType);
            move.type = moveType;
          }
        }
      } catch (e) {
        // Keep default type on error
        console.warn(`Failed to fetch type for ${move.name}`);
      }
    }));

    // Update UI after each batch
    const moveList = document.getElementById('moveset-move-list');
    if (moveList && currentMovesetPokemon) {
      // Update all moves with cached types
      moves.forEach(m => {
        if (moveTypeCache.has(m.name)) {
          m.type = moveTypeCache.get(m.name)!;
        }
      });
      renderMovesHTML(moves, moveList);
    }
  }
}

/**
 * Render a single move item with type-colored badge
 */
function renderMoveItem(move: MoveData, learnType: 'level' | 'machine' | 'other'): string {
  let badge = '';

  if (learnType === 'level' && move.level !== undefined) {
    badge = `Lv ${move.level}`;
  } else if (learnType === 'machine') {
    badge = 'TM';
  } else {
    // Capitalize the learn method
    badge = move.learnMethod.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // Get type config for move type coloring
  const typeConfig = getTypeConfig(move.type);
  const typeColor = typeConfig.color;

  // Capitalize move name
  const displayName = move.name.replace(/\b\w/g, c => c.toUpperCase());

  // Create type-colored badge with proper contrast
  return `
    <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
      <span class="px-2 py-1 rounded text-xs font-bold min-w-[60px] text-center text-white" style="background-color: ${typeColor};">${badge}</span>
      <span class="flex-1 font-bold text-gray-900 dark:text-white">${displayName}</span>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${typeColor};">${move.type}</span>
    </div>
  `;
}
