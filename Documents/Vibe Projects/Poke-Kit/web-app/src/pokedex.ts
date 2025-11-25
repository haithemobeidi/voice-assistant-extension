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
  sortOrder: 'asc',
  expandedPokemon: new Set()
};

// Display limit tracking for infinite scroll
let currentDisplayLimit = 20;
const LOAD_INCREMENT = 20;

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

  // Initial render
  renderPokemonGrid();
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
  currentDisplayLimit = 20;
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

  // Attach click listeners for expand buttons
  attachExpandListeners();

  // Show "Load More" button if there are more Pokémon
  if (state.filteredGroups.length > currentDisplayLimit) {
    const remaining = state.filteredGroups.length - currentDisplayLimit;
    const loadMoreDiv = document.createElement('div');
    loadMoreDiv.className = 'col-span-full text-center mt-8';
    loadMoreDiv.innerHTML = `
      <button id="load-more-btn" class="btn-primary">
        <i data-lucide="plus" class="w-5 h-5"></i>
        Load More (${remaining} remaining)
      </button>
    `;
    grid.appendChild(loadMoreDiv);

    document.getElementById('load-more-btn')?.addEventListener('click', loadMorePokemon);
  }

  // Initialize Lucide icons
  lucide.createIcons();
}

/**
 * Load more Pokémon into the grid
 */
function loadMorePokemon(): void {
  currentDisplayLimit += LOAD_INCREMENT;
  renderPokemonGrid();
}

/**
 * Attach click listeners to expand/collapse buttons
 */
function attachExpandListeners(): void {
  document.querySelectorAll('[data-expand-pokemon]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const pokemonNumber = parseInt(button.getAttribute('data-expand-pokemon') || '0');
      toggleExpand(pokemonNumber);
    });
  });
}

/**
 * Toggle expand/collapse state for a Pokémon
 */
function toggleExpand(pokemonNumber: number): void {
  if (state.expandedPokemon.has(pokemonNumber)) {
    state.expandedPokemon.delete(pokemonNumber);
  } else {
    state.expandedPokemon.add(pokemonNumber);
  }
  renderPokemonGrid();
}

/**
 * Generate TypeBadge HTML for Pokédex cards
 */
function TypeBadge(typeName: string): string {
  const config = getTypeConfig(typeName);
  return `
    <span
      class="px-2 py-1 rounded-full text-xs font-bold text-white uppercase"
      style="background-color: ${config.color};"
    >
      ${config.label}
    </span>
  `;
}

/**
 * Create a single Pokémon floating card (new design)
 * Uses HD official artwork with type-colored background splash
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

  // Create type badges
  const typeBadges = pokemon.types.map(t => TypeBadge(t)).join('');

  // Check if this Pokémon has variants
  const hasVariants = group.variants.length > 0;
  const isExpanded = state.expandedPokemon.has(pokemon.number);

  // Variant expansion UI
  const variantIndicator = hasVariants ? `
    <button
      class="absolute top-3 right-3 z-20 px-2 py-1 rounded-lg text-xs font-bold transition-colors"
      style="background-color: ${config.color}; color: white;"
      data-expand-pokemon="${pokemon.number}"
    >
      <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-3 h-3 inline-block mr-1"></i>
      ${group.variants.length} forms
    </button>
  ` : '';

  // Build card HTML
  let cardHtml = `
    <div
      class="group relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-visible mt-8 cursor-pointer"
      data-pokemon-id="${pokemon.id}"
    >
      <!-- Background type splash -->
      <div
        class="absolute inset-0 rounded-3xl opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"
        style="background-color: ${config.color};"
      ></div>

      ${variantIndicator}

      <!-- Floating sprite -->
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
        <img
          src="${spriteUrl}"
          alt="${name}"
          class="w-full h-full object-contain"
          loading="lazy"
          onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png'"
        />
      </div>

      <div class="pt-20 text-center relative z-0">
        <span class="block text-gray-400 font-bold text-xs tracking-widest mb-1">
          ${number}
        </span>
        <h3 class="text-xl font-black mb-3 text-gray-900 dark:text-white capitalize">
          ${name}
        </h3>

        <div class="flex justify-center gap-2 mb-4 flex-wrap">
          ${typeBadges}
        </div>

        <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 flex justify-between items-center border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-bold text-gray-400 uppercase">Total Stats</span>
          <span class="text-lg font-black" style="color: ${config.color};">${total}</span>
        </div>
      </div>
    </div>
  `;

  // Expanded variants
  if (isExpanded && hasVariants) {
    cardHtml += `
      <div class="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 pl-4 border-l-4 border-gray-200 dark:border-gray-700">
        ${group.variants.map(variant => createVariantCard(variant)).join('')}
      </div>
    `;
  }

  return cardHtml;
}

/**
 * Create a variant card (Mega, Regional forms, etc.)
 */
function createVariantCard(pokemon: PokemonCreature): string {
  const name = getDisplayName(pokemon);
  const total = getTotalStats(pokemon);
  const mainType = pokemon.types[0] || 'normal';
  const config = getTypeConfig(mainType);
  const formInfo = getFormInfo(pokemon);

  // Use HD official artwork
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  // Create type badges
  const typeBadges = pokemon.types.map(t => TypeBadge(t)).join('');

  return `
    <div
      class="group relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-visible mt-8"
    >
      <!-- Background type splash -->
      <div
        class="absolute inset-0 rounded-3xl opacity-5 dark:opacity-10 group-hover:opacity-10 transition-opacity"
        style="background-color: ${config.color};"
      ></div>

      <!-- Form badge -->
      ${formInfo ? `
        <div class="absolute top-3 left-3 z-20">
          <span class="px-2 py-1 rounded-lg text-xs font-bold bg-yellow-400 text-yellow-900">
            ${formInfo.formName}
          </span>
        </div>
      ` : ''}

      <!-- Floating sprite -->
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
        <img
          src="${spriteUrl}"
          alt="${name}"
          class="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div class="pt-20 text-center relative z-0">
        <h3 class="text-lg font-black mb-3 text-gray-900 dark:text-white">
          ${name}
        </h3>

        <div class="flex justify-center gap-2 mb-4 flex-wrap">
          ${typeBadges}
        </div>

        <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 flex justify-between items-center border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-bold text-gray-400 uppercase">BST</span>
          <span class="text-lg font-black" style="color: ${config.color};">${total}</span>
        </div>
      </div>
    </div>
  `;
}
