// pokedex.ts
// Pokédex browser with redesigned floating card UI and HD artwork
// Features: search, filter, sort, infinite scroll, variant expansion, moveset modal

import type {
  PokemonCreature,
  PokemonTypeLowercase,
  PokedexState,
  PokemonGroup
} from './types/pokemon';
import {
  getTotalStats,
  getDisplayName,
  hasType,
  formatPokedexNumber,
  toTitleCaseType,
  getGeneration,
  getFormInfo
} from './types/pokemon';
import { getTypeConfig } from './shared/typeConfig';
import { TypeBadgeSimple, TypeBadgeTiny } from './shared/components';
import { POKEDEX_CONFIG } from './shared/config';
import { loadPokemonData, getSpriteUrl } from './shared/pokemonLoader';
import { getFullDefensiveProfile } from './data/typeChart';
import type { PokemonType, DefensiveProfile } from './types/pokemon';

// Moveset modal state
let currentMovesetPokemon: PokemonCreature | null = null;

// Double-click tracking
let lastClickTime = 0;
let lastClickedCard: HTMLElement | null = null;
const DOUBLE_CLICK_DELAY = 400;

// Declare lucide global (loaded via CDN)
declare const lucide: {
  createIcons: () => void;
};

// Global state for Pokédex
let state: PokedexState = {
  allPokemon: [],
  pokemonGroups: [],
  filteredGroups: [],
  searchQuery: '',
  typeFilter: null,
  sortBy: 'number',
  sortOrder: 'asc'
};

// Display limit tracking for infinite scroll
let currentDisplayLimit = POKEDEX_CONFIG.INITIAL_DISPLAY_LIMIT;

// Intersection Observer for infinite scroll
let infiniteScrollObserver: IntersectionObserver | null = null;

/**
 * Initialize Pokédex - load data and set up event listeners
 */
export async function initPokedex(): Promise<void> {
  // Show loading state
  const loading = document.getElementById('pokedex-loading');
  if (loading) loading.style.display = 'block';

  try {
    // Load Pokemon data asynchronously (lazy loaded)
    const pokemonData = await loadPokemonData();
    state.allPokemon = pokemonData;

    // Group Pokémon by Pokédex number (base + variants)
    state.pokemonGroups = groupPokemonBySpecies(state.allPokemon);
    state.filteredGroups = [...state.pokemonGroups];

    // Populate type filter dropdown
    populateTypeFilter();

    // Set up event listeners
    setupEventListeners();

    // Set up infinite scroll observer
    setupInfiniteScroll();

    // Initial render
    renderPokemonGrid();
  } catch (error) {
    console.error('Failed to load Pokemon data:', error);
    const grid = document.getElementById('pokemon-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
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
 * Set up Intersection Observer for infinite scroll
 */
function setupInfiniteScroll(): void {
  // Clean up existing observer
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect();
  }

  infiniteScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Load more when sentinel is visible
          loadMorePokemon();
        }
      });
    },
    {
      root: null, // Use viewport
      rootMargin: '200px', // Load 200px before reaching bottom
      threshold: 0
    }
  );
}

/**
 * Group Pokémon by species (Pokédex number)
 * Separates base forms from variants (Mega, Regional, etc.)
 */
function groupPokemonBySpecies(allPokemon: PokemonCreature[]): PokemonGroup[] {
  const groups = new Map<number, PokemonGroup>();

  allPokemon.forEach(pokemon => {
    const number = pokemon.number;

    if (!groups.has(number)) {
      groups.set(number, {
        basePokemon: pokemon,
        variants: [],
        generation: getGeneration(number)
      });
    }

    const group = groups.get(number)!;
    const formInfo = getFormInfo(pokemon);

    if (formInfo === null) {
      group.basePokemon = pokemon;
    } else {
      group.variants.push(pokemon);
    }
  });

  return Array.from(groups.values()).sort((a, b) => a.basePokemon.number - b.basePokemon.number);
}

/**
 * Populate type filter dropdown with all 18 types
 */
function populateTypeFilter(): void {
  const typeFilter = document.getElementById('pokedex-type-filter') as HTMLSelectElement;
  if (!typeFilter) return;

  const types: PokemonTypeLowercase[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = toTitleCaseType(type);
    typeFilter.appendChild(option);
  });
}

/**
 * Set up event listeners for search, filter, and sort
 */
function setupEventListeners(): void {
  const searchInput = document.getElementById('pokedex-search') as HTMLInputElement;
  const typeFilter = document.getElementById('pokedex-type-filter') as HTMLSelectElement;
  const sortSelect = document.getElementById('pokedex-sort') as HTMLSelectElement;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      applyFiltersAndSort();
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      state.typeFilter = value as PokemonTypeLowercase || null;
      applyFiltersAndSort();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = (e.target as HTMLSelectElement).value as PokedexState['sortBy'];
      applyFiltersAndSort();
    });
  }
}

/**
 * Apply search, filter, and sort to Pokémon groups
 */
function applyFiltersAndSort(): void {
  currentDisplayLimit = POKEDEX_CONFIG.INITIAL_DISPLAY_LIMIT;
  let filtered = [...state.pokemonGroups];

  // Apply search filter (name or number)
  if (state.searchQuery) {
    filtered = filtered.filter(group => {
      const name = getDisplayName(group.basePokemon).toLowerCase();
      const number = group.basePokemon.number.toString();
      return name.includes(state.searchQuery) || number.includes(state.searchQuery);
    });
  }

  // Apply type filter
  if (state.typeFilter) {
    filtered = filtered.filter(group => hasType(group.basePokemon, state.typeFilter!));
  }

  // Apply sort
  filtered.sort((a, b) => {
    const pokemonA = a.basePokemon;
    const pokemonB = b.basePokemon;
    let aValue: number | string;
    let bValue: number | string;

    switch (state.sortBy) {
      case 'number':
        aValue = pokemonA.number;
        bValue = pokemonB.number;
        break;
      case 'name':
        aValue = getDisplayName(pokemonA).toLowerCase();
        bValue = getDisplayName(pokemonB).toLowerCase();
        return aValue < bValue ? -1 : 1;
      case 'hp':
        aValue = pokemonA.hp;
        bValue = pokemonB.hp;
        break;
      case 'attack':
        aValue = pokemonA.attack;
        bValue = pokemonB.attack;
        break;
      case 'defense':
        aValue = pokemonA.defense;
        bValue = pokemonB.defense;
        break;
      case 'speed':
        aValue = pokemonA.speed;
        bValue = pokemonB.speed;
        break;
      case 'total':
        aValue = getTotalStats(pokemonA);
        bValue = getTotalStats(pokemonB);
        break;
      default:
        aValue = pokemonA.number;
        bValue = pokemonB.number;
    }

    const isStatSort = ['hp', 'attack', 'defense', 'speed', 'total'].includes(state.sortBy);
    return isStatSort ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
  });

  state.filteredGroups = filtered;
  renderPokemonGrid();
}

/**
 * Render Pokémon cards in floating card grid style
 */
function renderPokemonGrid(): void {
  const grid = document.getElementById('pokemon-grid');
  const loading = document.getElementById('pokedex-loading');
  const empty = document.getElementById('pokedex-empty');

  if (!grid || !loading || !empty) return;

  // Hide loading state
  loading.style.display = 'none';

  // Show/hide empty state
  if (state.filteredGroups.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    lucide.createIcons();
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'grid';

  // Render cards up to current display limit
  const groupsToDisplay = state.filteredGroups.slice(0, currentDisplayLimit);
  grid.innerHTML = groupsToDisplay.map(group => createPokemonCard(group)).join('');

  // Attach click listeners for card flip and form cycling
  attachCardListeners();

  // Add infinite scroll sentinel if there are more Pokémon to load
  if (state.filteredGroups.length > currentDisplayLimit) {
    const remaining = state.filteredGroups.length - currentDisplayLimit;
    const sentinelDiv = document.createElement('div');
    sentinelDiv.id = 'infinite-scroll-sentinel';
    sentinelDiv.className = 'col-span-full text-center py-8';
    sentinelDiv.innerHTML = `
      <div class="flex flex-col items-center gap-2 text-gray-400">
        <div class="spinner"></div>
        <span class="text-sm">Loading more... (${remaining} remaining)</span>
      </div>
    `;
    grid.appendChild(sentinelDiv);

    // Observe the sentinel for infinite scroll
    if (infiniteScrollObserver) {
      infiniteScrollObserver.observe(sentinelDiv);
    }
  }

  // Initialize Lucide icons
  lucide.createIcons();
}

/**
 * Load more Pokémon into the grid
 */
function loadMorePokemon(): void {
  currentDisplayLimit += POKEDEX_CONFIG.LOAD_INCREMENT;
  renderPokemonGrid();
}

/**
 * Attach click listeners for card flip, form cycling, and double-click moveset modal
 */
function attachCardListeners(): void {
  // Card click handling: single-click = flip (with short delay), double-click = moveset modal
  // Strategy: Wait briefly before flipping to catch double-clicks, but keep delay short (200ms)
  document.querySelectorAll('.pokemon-card-container').forEach(container => {
    let flipTimeout: ReturnType<typeof setTimeout> | null = null;

    container.addEventListener('click', (e) => {
      // Don't trigger if clicking the form cycle button
      const target = e.target as HTMLElement;
      if (target.closest('[data-cycle-form]')) {
        return;
      }

      const card = container as HTMLElement;
      const now = Date.now();
      const isDoubleClick = (now - lastClickTime < DOUBLE_CLICK_DELAY) && lastClickedCard === card;

      if (isDoubleClick) {
        // Double-click: Cancel pending flip and open moveset modal
        if (flipTimeout) {
          clearTimeout(flipTimeout);
          flipTimeout = null;
        }

        e.preventDefault();
        e.stopPropagation();

        // Trigger ripple animation
        triggerRippleAnimation(card);

        // Get Pokémon data and open modal after animation
        const pokemonNumber = parseInt(card.getAttribute('data-pokemon-number') || '0');
        const formIndex = parseInt(card.getAttribute('data-form-index') || '0');
        const group = state.pokemonGroups.find(g => g.basePokemon.number === pokemonNumber);

        if (group) {
          const allForms = [group.basePokemon, ...group.variants];
          const pokemon = allForms[formIndex] || group.basePokemon;

          setTimeout(() => {
            openMovesetModal(pokemon);
          }, 300);
        }

        lastClickTime = 0;
        lastClickedCard = null;
      } else {
        // Single click: Show press feedback immediately, flip after short delay
        lastClickTime = now;
        lastClickedCard = card;

        // Instant visual feedback - card "presses" in
        card.classList.add('pressed');
        setTimeout(() => card.classList.remove('pressed'), 150);

        flipTimeout = setTimeout(() => {
          card.classList.toggle('flipped');
          flipTimeout = null;
        }, 200); // Short delay - feels responsive but catches most double-clicks
      }
    });
  });

  // Form cycling button
  document.querySelectorAll('[data-cycle-form]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const pokemonNumber = parseInt(button.getAttribute('data-cycle-form') || '0');
      cycleForm(pokemonNumber);
    });
  });

  // Calculator button (CSS handles disabling clicks when card is flipped)
  document.querySelectorAll('[data-calc-pokemon]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const container = button.closest('[data-pokemon-number]') as HTMLElement;
      const pokemonNumber = parseInt(button.getAttribute('data-calc-pokemon') || '0');
      const formIndex = parseInt(container?.getAttribute('data-form-index') || '0');
      const group = state.pokemonGroups.find(g => g.basePokemon.number === pokemonNumber);

      if (group) {
        const allForms = [group.basePokemon, ...group.variants];
        const pokemon = allForms[formIndex] || group.basePokemon;
        openMatchupModal(pokemon);
      }
    });
  });
}

/**
 * Trigger ripple animation inside a card
 */
function triggerRippleAnimation(card: HTMLElement): void {
  // Add ripple container if not exists
  const cardFront = card.querySelector('.pokemon-card-front > div') as HTMLElement;
  if (!cardFront) return;

  // Create ripple container and wave
  let rippleContainer = cardFront.querySelector('.ripple-container') as HTMLElement;
  if (!rippleContainer) {
    rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container';
    const rippleWave = document.createElement('div');
    rippleWave.className = 'ripple-wave';
    rippleContainer.appendChild(rippleWave);
    cardFront.appendChild(rippleContainer);
  }

  const rippleWave = rippleContainer.querySelector('.ripple-wave') as HTMLElement;
  if (rippleWave) {
    // Reset and trigger animation
    rippleWave.classList.remove('active');
    void rippleWave.offsetWidth; // Force reflow
    rippleWave.classList.add('active');
    setTimeout(() => rippleWave.classList.remove('active'), 600);
  }

}

/**
 * Cycle through forms for a Pokémon
 */
function cycleForm(pokemonNumber: number): void {
  const group = state.pokemonGroups.find(g => g.basePokemon.number === pokemonNumber);
  if (!group || group.variants.length === 0) return;

  // Find the card container
  const container = document.querySelector(`[data-pokemon-number="${pokemonNumber}"]`) as HTMLElement;
  if (!container) return;

  // Get current form index
  let currentIndex = parseInt(container.getAttribute('data-form-index') || '0');

  // Calculate next index (cycle through base + all variants)
  const allForms = [group.basePokemon, ...group.variants];
  currentIndex = (currentIndex + 1) % allForms.length;
  container.setAttribute('data-form-index', currentIndex.toString());

  // Get the new form's data
  const newForm = allForms[currentIndex];
  const newName = getDisplayName(newForm);
  const newTotal = getTotalStats(newForm);
  const mainType = newForm.types[0] || 'normal';
  const config = getTypeConfig(mainType);
  const spriteUrl = getSpriteUrl(newForm);

  // Update front of card
  const sprite = container.querySelector('.pokemon-sprite') as HTMLImageElement;
  const name = container.querySelector('.pokemon-name') as HTMLElement;
  const types = container.querySelector('.pokemon-types') as HTMLElement;
  const bst = container.querySelector('.pokemon-bst') as HTMLElement;

  if (sprite) sprite.src = spriteUrl;
  if (name) name.textContent = newName;
  if (types) types.innerHTML = newForm.types.map(t => TypeBadgeSimple(t)).join('');
  if (bst) {
    bst.textContent = newTotal.toString();
    bst.style.color = config.color;
  }

  // Update back of card
  const spriteBack = container.querySelector('.pokemon-sprite-back') as HTMLImageElement;
  const nameBack = container.querySelector('.pokemon-name-back') as HTMLElement;
  const typesBack = container.querySelector('.pokemon-types-back') as HTMLElement;
  const bstBack = container.querySelector('.pokemon-bst-back') as HTMLElement;
  const statsContainer = container.querySelector('.pokemon-stats') as HTMLElement;

  if (spriteBack) spriteBack.src = spriteUrl;
  if (nameBack) nameBack.textContent = newName;
  if (typesBack) typesBack.innerHTML = newForm.types.map(t => TypeBadgeTiny(t)).join('');
  if (bstBack) {
    bstBack.textContent = newTotal.toString();
    bstBack.style.color = config.color;
  }
  if (statsContainer) {
    // Rebuild stat bars and total
    statsContainer.innerHTML = createStatBars(newForm) + `
      <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
        <span class="text-xs font-bold text-gray-400 uppercase">Total</span>
        <span class="text-sm font-black pokemon-bst-back" style="color: ${config.color};">${newTotal}</span>
      </div>
    `;
  }

  // Update background splash color on both sides (only the large background divs, not type badges)
  const frontBgSplash = container.querySelector('.pokemon-card-front [class*="opacity-"]') as HTMLElement;
  const backBgSplash = container.querySelector('.pokemon-card-back [class*="opacity-"]') as HTMLElement;
  if (frontBgSplash) frontBgSplash.style.backgroundColor = config.color;
  if (backBgSplash) backBgSplash.style.backgroundColor = config.color;
}


/**
 * Create a single Pokémon floating card with flip animation
 * Front: sprite, name, types, BST
 * Back: detailed stat bars
 */
function createPokemonCard(group: PokemonGroup): string {
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
  let cardHtml = `
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
function createStatBars(pokemon: PokemonCreature): string {
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

// Old createVariantCard removed - form cycling now used instead

// ============================================================================
// MOVESET MODAL FUNCTIONALITY
// ============================================================================

interface MoveData {
  name: string;
  type: string;
  learnMethod: string;
  level?: number;
  machine?: string;
  url?: string; // URL to fetch move details
}

interface MovesByGen {
  [gen: string]: MoveData[];
}

// Cache for fetched move data
const moveCache = new Map<string, MovesByGen>();

// Cache for move type lookups (move name -> type)
const moveTypeCache = new Map<string, string>();

/**
 * Open the moveset modal for a Pokémon
 */
async function openMovesetModal(pokemon: PokemonCreature): Promise<void> {
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
function closeMovesetModal(): void {
  const modal = document.getElementById('moveset-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentMovesetPokemon = null;
  document.removeEventListener('keydown', handleModalKeydown);
}

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

  // Level Up Moves - improved header visibility
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

  // TM/HM Moves - improved header visibility
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

  // Other Moves (tutor, egg, etc.) - improved header visibility
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

// ============================================================================
// TYPE MATCHUP MODAL
// ============================================================================

let currentMatchupPokemon: PokemonCreature | null = null;

/**
 * Open the type matchup modal for a Pokémon
 */
function openMatchupModal(pokemon: PokemonCreature): void {
  currentMatchupPokemon = pokemon;

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
function closeMatchupModal(): void {
  const modal = document.getElementById('matchup-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  currentMatchupPokemon = null;
  document.removeEventListener('keydown', handleMatchupModalKeydown);
}

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
