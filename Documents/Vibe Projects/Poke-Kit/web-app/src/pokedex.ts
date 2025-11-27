// pokedex.ts
// Pokédex browser with redesigned floating card UI and HD artwork
// Features: search, filter, sort, infinite scroll, variant expansion
// Modals: moveset (double-click) and type matchup (calculator button)

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
  toTitleCaseType,
  getGeneration,
  getFormInfo
} from './types/pokemon';
import { getTypeConfig } from './shared/typeConfig';
import { TypeBadgeSimple, TypeBadgeTiny } from './shared/components';
import { POKEDEX_CONFIG } from './shared/config';
import { loadPokemonData, getSpriteUrl } from './shared/pokemonLoader';

// Import modular components
import { createPokemonCard, createStatBars } from './pokedex/cardRenderer';
import { openMovesetModal, closeMovesetModal } from './pokedex/movesetModal';
import { openMatchupModal, closeMatchupModal } from './pokedex/matchupModal';

// Re-export for external access if needed
export { openMovesetModal, closeMovesetModal, openMatchupModal, closeMatchupModal };

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

// ============================================================================
// INITIALIZATION
// ============================================================================

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

// ============================================================================
// INFINITE SCROLL
// ============================================================================

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
 * Load more Pokémon into the grid
 */
function loadMorePokemon(): void {
  currentDisplayLimit += POKEDEX_CONFIG.LOAD_INCREMENT;
  renderPokemonGrid();
}

// ============================================================================
// GROUPING & FILTERING
// ============================================================================

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

// ============================================================================
// GRID RENDERING
// ============================================================================

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

// ============================================================================
// CARD INTERACTION HANDLERS
// ============================================================================

/**
 * Attach click listeners for card flip, form cycling, and double-click moveset modal
 */
function attachCardListeners(): void {
  // Card click handling: single-click = flip (with short delay), double-click = moveset modal
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
        }, 200);
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

  // Update background splash color on both sides
  const frontBgSplash = container.querySelector('.pokemon-card-front [class*="opacity-"]') as HTMLElement;
  const backBgSplash = container.querySelector('.pokemon-card-back [class*="opacity-"]') as HTMLElement;
  if (frontBgSplash) frontBgSplash.style.backgroundColor = config.color;
  if (backBgSplash) backBgSplash.style.backgroundColor = config.color;
}
