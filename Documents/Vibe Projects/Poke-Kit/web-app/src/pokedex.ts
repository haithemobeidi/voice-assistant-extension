// pokedex.ts
// Pokédex browser functionality: search, filter, sort, and display Pokémon

import type {
  PokemonCreature,
  PokemonTypeLowercase,
  PokedexState,
  PokemonType,
  PokemonGroup
} from './types/pokemon'
import {
  getTotalStats,
  getDisplayName,
  hasType,
  formatPokedexNumber,
  toTitleCaseType,
  getGeneration,
  getFormInfo
} from './types/pokemon'
import pokemonData from './data/pokemon.json'

// Type colors for type badges
const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#A8A878',
  Fire: '#F08030',
  Water: '#6890F0',
  Electric: '#F8D030',
  Grass: '#78C850',
  Ice: '#98D8D8',
  Fighting: '#C03028',
  Poison: '#A040A0',
  Ground: '#E0C068',
  Flying: '#A890F0',
  Psychic: '#F85888',
  Bug: '#A8B820',
  Rock: '#B8A038',
  Ghost: '#705898',
  Dragon: '#7038F8',
  Dark: '#705848',
  Steel: '#B8B8D0',
  Fairy: '#EE99AC'
}

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
}

/**
 * Initialize Pokédex - load data and set up event listeners
 */
export function initPokedex() {
  console.log('Initializing Pokédex...')

  // Load ALL Pokémon data (including variants)
  state.allPokemon = pokemonData as PokemonCreature[]

  // Group Pokémon by Pokédex number (base + variants)
  state.pokemonGroups = groupPokemonBySpecies(state.allPokemon)
  state.filteredGroups = [...state.pokemonGroups]

  console.log(`Loaded ${state.pokemonGroups.length} Pokémon species (${state.allPokemon.length} total including variants)`)

  // Populate type filter dropdown
  populateTypeFilter()

  // Set up event listeners
  setupEventListeners()

  // Initial render
  renderPokemonGrid()
}

/**
 * Group Pokémon by species (Pokédex number)
 * Separates base forms from variants (Mega, Regional, etc.)
 */
function groupPokemonBySpecies(allPokemon: PokemonCreature[]): PokemonGroup[] {
  const groups = new Map<number, PokemonGroup>()

  allPokemon.forEach(pokemon => {
    const number = pokemon.number

    if (!groups.has(number)) {
      // Create new group for this species
      groups.set(number, {
        basePokemon: pokemon, // Will be replaced if we find actual base form
        variants: [],
        generation: getGeneration(number)
      })
    }

    const group = groups.get(number)!
    const formInfo = getFormInfo(pokemon)

    if (formInfo === null) {
      // This is the base form
      group.basePokemon = pokemon
    } else {
      // This is a variant
      group.variants.push(pokemon)
    }
  })

  // Convert map to array and sort by Pokédex number
  return Array.from(groups.values()).sort((a, b) => a.basePokemon.number - b.basePokemon.number)
}

/**
 * Populate type filter dropdown with all 18 types
 */
function populateTypeFilter() {
  const typeFilter = document.getElementById('pokedex-type-filter') as HTMLSelectElement
  if (!typeFilter) return

  const types: PokemonTypeLowercase[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]

  types.forEach(type => {
    const option = document.createElement('option')
    option.value = type
    option.textContent = toTitleCaseType(type)
    typeFilter.appendChild(option)
  })
}

/**
 * Set up event listeners for search, filter, and sort
 */
function setupEventListeners() {
  const searchInput = document.getElementById('pokedex-search') as HTMLInputElement
  const typeFilter = document.getElementById('pokedex-type-filter') as HTMLSelectElement
  const sortSelect = document.getElementById('pokedex-sort') as HTMLSelectElement

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = (e.target as HTMLInputElement).value.toLowerCase()
      applyFiltersAndSort()
    })
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value
      state.typeFilter = value as PokemonTypeLowercase || null
      applyFiltersAndSort()
    })
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = (e.target as HTMLSelectElement).value as PokedexState['sortBy']
      applyFiltersAndSort()
    })
  }
}

/**
 * Apply search, filter, and sort to Pokémon groups
 */
function applyFiltersAndSort() {
  let filtered = [...state.pokemonGroups]

  // Apply search filter (name or number)
  if (state.searchQuery) {
    filtered = filtered.filter(group => {
      const name = getDisplayName(group.basePokemon).toLowerCase()
      const number = group.basePokemon.number.toString()
      return name.includes(state.searchQuery) || number.includes(state.searchQuery)
    })
  }

  // Apply type filter
  if (state.typeFilter) {
    filtered = filtered.filter(group => hasType(group.basePokemon, state.typeFilter!))
  }

  // Apply sort
  filtered.sort((a, b) => {
    const pokemonA = a.basePokemon
    const pokemonB = b.basePokemon
    let aValue: number | string
    let bValue: number | string

    switch (state.sortBy) {
      case 'number':
        aValue = pokemonA.number
        bValue = pokemonB.number
        break
      case 'name':
        aValue = getDisplayName(pokemonA).toLowerCase()
        bValue = getDisplayName(pokemonB).toLowerCase()
        return aValue < bValue ? -1 : 1
      case 'hp':
        aValue = pokemonA.hp
        bValue = pokemonB.hp
        break
      case 'attack':
        aValue = pokemonA.attack
        bValue = pokemonB.attack
        break
      case 'defense':
        aValue = pokemonA.defense
        bValue = pokemonB.defense
        break
      case 'speed':
        aValue = pokemonA.speed
        bValue = pokemonB.speed
        break
      case 'total':
        aValue = getTotalStats(pokemonA)
        bValue = getTotalStats(pokemonB)
        break
      default:
        aValue = pokemonA.number
        bValue = pokemonB.number
    }

    // Descending order for stats (not number or name)
    const isStatSort = state.sortBy === 'hp' || state.sortBy === 'attack' ||
                       state.sortBy === 'defense' || state.sortBy === 'speed' ||
                       state.sortBy === 'total'

    if (isStatSort) {
      return (bValue as number) > (aValue as number) ? 1 : -1
    }

    return aValue > bValue ? 1 : -1
  })

  state.filteredGroups = filtered
  renderPokemonGrid()
}

/**
 * Render Pokémon cards in grid
 */
function renderPokemonGrid() {
  const grid = document.getElementById('pokemon-grid')
  const loading = document.getElementById('pokedex-loading')
  const empty = document.getElementById('pokedex-empty')

  if (!grid || !loading || !empty) return

  // Hide loading state
  loading.style.display = 'none'

  // Show/hide empty state
  if (state.filteredGroups.length === 0) {
    grid.style.display = 'none'
    empty.style.display = 'block'
    return
  }

  empty.style.display = 'none'
  grid.style.display = 'grid'

  // Render cards (limit to first 50 for performance)
  const displayLimit = 50
  const groupsToDisplay = state.filteredGroups.slice(0, displayLimit)

  grid.innerHTML = groupsToDisplay.map(group => createPokemonGroupCard(group)).join('')

  // Attach click listeners for expand buttons
  attachExpandListeners()

  // Show "Load More" button if there are more Pokémon
  if (state.filteredGroups.length > displayLimit) {
    const loadMoreBtn = document.createElement('div')
    loadMoreBtn.className = 'col-span-full text-center mt-4'
    loadMoreBtn.innerHTML = `
      <button class="btn btn-primary px-8" onclick="alert('Load more functionality coming soon!')">
        Load More (${state.filteredGroups.length - displayLimit} remaining)
      </button>
    `
    grid.appendChild(loadMoreBtn)
  }
}

/**
 * Attach click listeners to expand/collapse buttons
 */
function attachExpandListeners() {
  document.querySelectorAll('[data-expand-pokemon]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation()
      const pokemonNumber = parseInt(button.getAttribute('data-expand-pokemon') || '0')
      toggleExpand(pokemonNumber)
    })
  })
}

/**
 * Toggle expand/collapse state for a Pokémon
 */
function toggleExpand(pokemonNumber: number) {
  if (state.expandedPokemon.has(pokemonNumber)) {
    state.expandedPokemon.delete(pokemonNumber)
  } else {
    state.expandedPokemon.add(pokemonNumber)
  }

  // Re-render to show/hide variants
  renderPokemonGrid()
}

/**
 * Create a Pokémon group card (base + variants)
 */
function createPokemonGroupCard(group: PokemonGroup): string {
  const isExpanded = state.expandedPokemon.has(group.basePokemon.number)
  const hasVariants = group.variants.length > 0

  // Base card
  let html = createSinglePokemonCard(group.basePokemon, group.generation, hasVariants, isExpanded)

  // Variant cards (if expanded)
  if (isExpanded && hasVariants) {
    html += `<div class="col-span-full ml-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`
    group.variants.forEach(variant => {
      html += createSinglePokemonCard(variant, group.generation, false, false, true)
    })
    html += `</div>`
  }

  return html
}

/**
 * Create a single Pokémon card HTML
 */
function createSinglePokemonCard(
  pokemon: PokemonCreature,
  generation: number,
  hasVariants: boolean = false,
  isExpanded: boolean = false,
  isVariant: boolean = false
): string {
  const name = getDisplayName(pokemon)
  const number = formatPokedexNumber(pokemon.number)
  const total = getTotalStats(pokemon)
  const formInfo = getFormInfo(pokemon)

  // Get sprite URL (using PokéAPI for now)
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.number}.png`

  // Create type pills
  const typePills = pokemon.types.map(type => {
    const titleCaseType = toTitleCaseType(type)
    const color = TYPE_COLORS[titleCaseType] || '#777'
    return `
      <span class="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold" style="background-color: ${color};">
        ${titleCaseType}
      </span>
    `
  }).join('')

  // Generation badge
  const genBadge = isVariant ? '' : `<span class="absolute top-2 left-2 bg-poke-blue text-white px-2 py-1 rounded text-xs font-bold">Gen ${generation}</span>`

  // Form badge for variants
  const formBadge = formInfo ? `
    <div class="mb-2">
      <span class="inline-block bg-poke-yellow text-poke-dark px-3 py-1 rounded-full text-xs font-bold">${formInfo.formName}</span>
      <p class="text-xs text-gray-500 mt-1">${formInfo.debutGame}</p>
    </div>
  ` : ''

  // Expand button for base cards with variants
  const expandButton = hasVariants && !isVariant ? `
    <button
      class="mt-3 w-full py-2 bg-poke-light-gray hover:bg-poke-gray rounded-lg text-sm font-semibold transition"
      data-expand-pokemon="${pokemon.number}"
    >
      <i class="ph-fill ph-caret-${isExpanded ? 'up' : 'down'}"></i>
      ${isExpanded ? 'Hide' : 'View'} Forms (${hasVariants ? state.pokemonGroups.find(g => g.basePokemon.number === pokemon.number)?.variants.length || 0 : 0})
    </button>
  ` : ''

  return `
    <div class="card hover:shadow-xl transition ${isVariant ? 'bg-gray-50' : ''}">
      <!-- Pokémon Image -->
      <div class="relative bg-poke-light-gray rounded-lg p-6 mb-4 flex items-center justify-center h-32 group-hover:bg-poke-gray transition">
        ${genBadge}
        <img
          src="${spriteUrl}"
          alt="${name}"
          class="w-24 h-24 object-contain pixelated"
          onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'"
        />
        <span class="absolute top-2 right-2 text-sm font-semibold text-gray-400">${number}</span>
      </div>

      <!-- Form Badge (variants only) -->
      ${formBadge}

      <!-- Pokémon Info -->
      <h3 class="font-bold text-lg mb-2 text-poke-dark">${name}</h3>

      <!-- Types -->
      <div class="flex gap-2 mb-3">
        ${typePills}
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <div class="text-gray-500">HP</div>
          <div class="font-semibold">${pokemon.hp}</div>
        </div>
        <div>
          <div class="text-gray-500">ATK</div>
          <div class="font-semibold">${pokemon.attack}</div>
        </div>
        <div>
          <div class="text-gray-500">DEF</div>
          <div class="font-semibold">${pokemon.defense}</div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-xs mt-2">
        <div>
          <div class="text-gray-500">SP.ATK</div>
          <div class="font-semibold">${pokemon.spAttack}</div>
        </div>
        <div>
          <div class="text-gray-500">SP.DEF</div>
          <div class="font-semibold">${pokemon.spDefense}</div>
        </div>
        <div>
          <div class="text-gray-500">SPD</div>
          <div class="font-semibold">${pokemon.speed}</div>
        </div>
      </div>

      <!-- Total Stats -->
      <div class="mt-3 pt-3 border-t border-poke-gray text-center">
        <div class="text-xs text-gray-500">Total Stats</div>
        <div class="font-bold text-poke-blue">${total}</div>
      </div>

      <!-- Expand Button -->
      ${expandButton}
    </div>
  `
}
