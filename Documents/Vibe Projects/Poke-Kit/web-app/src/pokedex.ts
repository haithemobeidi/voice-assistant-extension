// pokedex.ts
// Pokédex browser with redesigned floating card UI and HD artwork
// Features: search, filter, sort, infinite scroll, variant expansion

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
import pokemonData from './data/pokemon.json';

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
export function initPokedex(): void {
  // Load ALL Pokémon data (including variants)
  state.allPokemon = pokemonData as PokemonCreature[];

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
 * Attach click listeners for card flip and form cycling
 */
function attachCardListeners(): void {
  // Card flip on click (anywhere on card except form button)
  document.querySelectorAll('.pokemon-card-container').forEach(container => {
    container.addEventListener('click', (e) => {
      // Don't flip if clicking the form cycle button
      const target = e.target as HTMLElement;
      if (target.closest('[data-cycle-form]')) {
        return;
      }
      container.classList.toggle('flipped');
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
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${newForm.id}.png`;

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
    statsContainer.innerHTML = createStatBars(newForm, config.color) + `
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

  // Use HD official artwork
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  // Create type badges using shared components
  const typeBadges = pokemon.types.map(t => TypeBadgeSimple(t)).join('');
  const typeBadgesSmall = pokemon.types.map(t => TypeBadgeTiny(t)).join('');

  // Check if this Pokémon has variants
  const hasVariants = group.variants.length > 0;
  const totalForms = 1 + group.variants.length;

  // Form cycling button (only if has variants)
  const formButton = hasVariants ? `
    <button
      class="absolute top-3 right-3 z-20 px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 bg-purple-600 text-white hover:bg-purple-500"
      data-cycle-form="${pokemon.number}"
    >
      <i data-lucide="repeat" class="w-3 h-3"></i>
      <span>${totalForms}</span>
    </button>
  ` : '';

  // Build stat bars for back of card
  const statBars = createStatBars(pokemon, config.color);

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
          <div class="relative bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-lg border-2 border-purple-500 dark:border-purple-400 h-full">
            <!-- Background type splash -->
            <div
              class="absolute inset-0 rounded-3xl opacity-5 dark:opacity-10"
              style="background-color: ${config.color};"
            ></div>

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
function createStatBars(pokemon: PokemonCreature, _accentColor: string): string {
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
