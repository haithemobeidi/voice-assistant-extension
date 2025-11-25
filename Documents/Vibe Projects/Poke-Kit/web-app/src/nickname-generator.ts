// nickname-generator.ts
// AI-powered nickname generator using Google Gemini API

import type { PokemonCreature, PokemonType } from './types/pokemon'
import { toTitleCaseType, TYPE_COLORS } from './types/pokemon'

/**
 * Get the full display name for a Pokémon including form name
 * e.g., "Mega Charizard X" instead of just "Charizard"
 */
function getFullDisplayName(pokemon: PokemonCreature): string {
  // If formNames.en exists, use it (for Mega, Regional, etc.)
  if (pokemon.formNames && pokemon.formNames.en) {
    return pokemon.formNames.en
  }
  // Otherwise use species name
  return pokemon.speciesNames.en || pokemon.name
}

/**
 * Get the correct sprite URL using the unique ID
 * This correctly displays Mega, Regional, and other variant forms
 */
function getSpriteUrl(pokemon: PokemonCreature): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
}

import pokemonData from './data/pokemon.json'

// Types for nickname generation
export type NicknameStyle = 'cool' | 'cute' | 'funny' | 'mythical' | null
export type NameLength = 'short' | 'medium' | 'long' | null

interface NicknameState {
  selectedPokemon: PokemonCreature | null
  style: NicknameStyle
  useTypes: boolean | null
  length: NameLength
  generatedNames: string[]
  favorites: string[]
  isLoading: boolean
  error: string | null
}

// Default state factory - returns fresh state with NOTHING selected
function createDefaultState(): NicknameState {
  return {
    selectedPokemon: null,
    style: null,           // Nothing selected
    useTypes: null,        // Nothing selected
    length: null,          // Nothing selected
    generatedNames: [],
    favorites: JSON.parse(localStorage.getItem('nickname-favorites') || '[]'),
    isLoading: false,
    error: null
  }
}

/**
 * Cleanup function - called when navigating away from nickname page
 * Completely resets all state and clears the DOM
 */
export function cleanupNicknameGenerator() {
  // Reset to completely fresh default state
  state = createDefaultState()

  // Clear the DOM content
  const container = document.getElementById('nickname-generator-content')
  if (container) {
    container.innerHTML = ''
  }
}

// Global state - always starts fresh
let state: NicknameState = createDefaultState()

// Pokemon data for search
const allPokemon = pokemonData as PokemonCreature[]

// Track global listener setup using a DOM attribute to survive HMR
const LISTENER_ATTR = 'data-nickname-listeners-attached'

/**
 * Initialize the nickname generator
 * Called each time user navigates to the Nicknames page
 * Ensures completely fresh state every time
 */
export function initNicknameGenerator() {
  // Create completely fresh state (except favorites from localStorage)
  state = createDefaultState()

  // Clear the container to remove any old DOM with stale state
  const container = document.getElementById('nickname-generator-content')
  if (container) {
    container.innerHTML = ''
  }

  // Render fresh UI with fresh state
  renderGenerator()

  // Only set up global document listeners once (survives HMR via DOM attribute)
  if (!document.body.hasAttribute(LISTENER_ATTR)) {
    setupGlobalListeners()
    document.body.setAttribute(LISTENER_ATTR, 'true')
  }
}

/**
 * Set up global document-level listeners (only called once)
 */
function setupGlobalListeners() {
  // Close search results when clicking outside (document-level, only once)
  document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('search-container')
    if (searchContainer && !searchContainer.contains(e.target as Node)) {
      hideSearchResults()
    }
  })
}

/**
 * Set up element-specific event listeners (called after each render)
 */
function setupElementListeners() {
  // Pokemon search input
  const searchInput = document.getElementById('pokemon-search') as HTMLInputElement
  if (searchInput) {
    searchInput.addEventListener('input', handlePokemonSearch)
    searchInput.addEventListener('focus', () => showSearchResults())
  }

  // Style button handlers
  document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      setStyle(btn.getAttribute('data-style') as NicknameStyle)
    })
  })

  // Type reference button handlers
  document.querySelectorAll('[data-use-types]').forEach(btn => {
    btn.addEventListener('click', () => {
      setUseTypes(btn.getAttribute('data-use-types') === 'true')
    })
  })

  // Length button handlers
  document.querySelectorAll('[data-length]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLength(btn.getAttribute('data-length') as NameLength)
    })
  })

  // Generate button handler
  document.getElementById('generate-btn')?.addEventListener('click', generateNicknames)
}

/**
 * Handle Pokemon search input
 */
function handlePokemonSearch(e: Event) {
  const query = (e.target as HTMLInputElement).value.toLowerCase()
  if (query.length < 2) {
    hideSearchResults()
    return
  }

  const matches = allPokemon
    .filter(p => {
      // Search by full display name (includes form name for variants)
      const fullName = getFullDisplayName(p).toLowerCase()
      // Also search by species name (base name)
      const speciesName = (p.speciesNames.en || '').toLowerCase()
      // And by internal name (e.g., "charizard-mega-x")
      const internalName = p.name.toLowerCase()
      // And by Pokédex number
      const numStr = p.number.toString()

      return fullName.includes(query) ||
             speciesName.includes(query) ||
             internalName.includes(query) ||
             numStr.includes(query)
    })
    .slice(0, 10) // Limit to 10 results

  renderSearchResults(matches)
}

/**
 * Render search results dropdown
 */
function renderSearchResults(pokemon: PokemonCreature[]) {
  const resultsContainer = document.getElementById('search-results')
  if (!resultsContainer) return

  if (pokemon.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-3 text-gray-500 text-center">No Pokémon found</div>
    `
  } else {
    resultsContainer.innerHTML = pokemon.map(p => {
      const name = getFullDisplayName(p)
      const types = p.types.map(t => toTitleCaseType(t))
      const spriteUrl = getSpriteUrl(p)

      return `
        <button class="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition"
                data-pokemon-id="${p.id}">
          <img src="${spriteUrl}" alt="${name}" class="w-10 h-10">
          <div class="text-left">
            <p class="font-medium">${name}</p>
            <div class="flex gap-1">
              ${types.map(t => `
                <span class="text-xs px-2 py-0.5 rounded-full text-white" style="background-color: ${TYPE_COLORS[t as PokemonType]}">
                  ${t}
                </span>
              `).join('')}
            </div>
          </div>
        </button>
      `
    }).join('')
  }

  resultsContainer.classList.remove('hidden')

  // Attach click handlers - now using unique ID instead of number
  resultsContainer.querySelectorAll('[data-pokemon-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-pokemon-id') || ''
      selectPokemonById(id)
    })
  })
}

/**
 * Show search results container
 */
function showSearchResults() {
  const query = (document.getElementById('pokemon-search') as HTMLInputElement)?.value
  if (query && query.length >= 2) {
    handlePokemonSearch({ target: { value: query } } as unknown as Event)
  }
}

/**
 * Hide search results container
 */
function hideSearchResults() {
  const resultsContainer = document.getElementById('search-results')
  if (resultsContainer) {
    resultsContainer.classList.add('hidden')
  }
}

/**
 * Select a Pokemon for nickname generation by unique ID
 */
function selectPokemonById(id: string) {
  const pokemon = allPokemon.find(p => p.id === id)
  if (pokemon) {
    state.selectedPokemon = pokemon
    hideSearchResults()
    const searchInput = document.getElementById('pokemon-search') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
    }
    renderSelectedPokemon()
  }
}

/**
 * Render selected Pokemon preview
 */
function renderSelectedPokemon() {
  const container = document.getElementById('selected-pokemon')
  if (!container) return

  if (!state.selectedPokemon) {
    container.innerHTML = `
      <div class="text-gray-400 text-center py-4">
        <i class="ph-fill ph-question text-4xl mb-2"></i>
        <p>Select a Pokémon above</p>
      </div>
    `
    return
  }

  const p = state.selectedPokemon
  const name = getFullDisplayName(p)
  const types = p.types.map(t => toTitleCaseType(t))
  const spriteUrl = getSpriteUrl(p)

  container.innerHTML = `
    <div class="flex items-center gap-4">
      <img src="${spriteUrl}" alt="${name}" class="w-20 h-20">
      <div>
        <p class="font-bold text-lg">${name}</p>
        <p class="text-gray-500 text-sm">#${p.number.toString().padStart(4, '0')}</p>
        <div class="flex gap-1 mt-1">
          ${types.map(t => `
            <span class="text-xs px-3 py-1 rounded-full text-white font-medium" style="background-color: ${TYPE_COLORS[t as PokemonType]}">
              ${t}
            </span>
          `).join('')}
        </div>
      </div>
      <button id="clear-pokemon" class="ml-auto text-gray-400 hover:text-red-500 transition">
        <i class="ph-fill ph-x-circle text-2xl"></i>
      </button>
    </div>
  `

  // Clear button handler
  document.getElementById('clear-pokemon')?.addEventListener('click', () => {
    state.selectedPokemon = null
    renderSelectedPokemon()
  })
}

/**
 * Set nickname style
 */
function setStyle(style: NicknameStyle) {
  state.style = style
  updateStyleButtons()
}

/**
 * Update style button states
 */
function updateStyleButtons() {
  document.querySelectorAll('[data-style]').forEach(btn => {
    const style = btn.getAttribute('data-style') as NicknameStyle
    if (style === state.style) {
      btn.classList.add('border-poke-blue', 'bg-blue-50')
      btn.classList.remove('border-gray-200')
    } else {
      btn.classList.remove('border-poke-blue', 'bg-blue-50')
      btn.classList.add('border-gray-200')
    }
  })
}

/**
 * Set type reference preference
 */
function setUseTypes(useTypes: boolean) {
  state.useTypes = useTypes
  updateTypeButtons()
}

/**
 * Update type reference button states
 */
function updateTypeButtons() {
  document.querySelectorAll('[data-use-types]').forEach(btn => {
    const btnValue = btn.getAttribute('data-use-types') === 'true'
    // Compare strictly - null means nothing selected
    if (state.useTypes !== null && btnValue === state.useTypes) {
      btn.classList.add('border-poke-blue', 'bg-blue-50')
      btn.classList.remove('border-gray-200')
    } else {
      btn.classList.remove('border-poke-blue', 'bg-blue-50')
      btn.classList.add('border-gray-200')
    }
  })
}

/**
 * Set name length preference
 */
function setLength(length: NameLength) {
  state.length = length
  updateLengthButtons()
}

/**
 * Update length button states
 */
function updateLengthButtons() {
  document.querySelectorAll('[data-length]').forEach(btn => {
    const length = btn.getAttribute('data-length') as NameLength
    if (length === state.length) {
      btn.classList.add('border-poke-blue', 'bg-blue-50')
      btn.classList.remove('border-gray-200')
    } else {
      btn.classList.remove('border-poke-blue', 'bg-blue-50')
      btn.classList.add('border-gray-200')
    }
  })
}

// Available models in order of preference (2.0 is more stable)
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
]

/**
 * Call Gemini API with retry logic and model fallback
 */
async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  modelIndex = 0,
  retryCount = 0
): Promise<string[]> {
  const maxRetries = 2
  const model = GEMINI_MODELS[modelIndex]

  if (!model) {
    throw new Error('All models are currently unavailable. Please try again later.')
  }


  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 256,
          }
        })
      }
    )

    // Handle 503 and other errors before trying to parse JSON
    if (response.status === 503) {
      console.log(`Model ${model} returned 503 (overloaded), trying next...`)

      // Try next model
      if (modelIndex < GEMINI_MODELS.length - 1) {
        return callGeminiAPI(apiKey, prompt, modelIndex + 1, retryCount)
      }

      // All models tried, retry with backoff
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`All models busy, waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return callGeminiAPI(apiKey, prompt, 0, retryCount + 1)
      }

      throw new Error('AI service is currently busy. Please try again in a few moments.')
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // Response wasn't JSON, use status code
      }

      // Invalid API key - clear and throw
      if (response.status === 400 && errorMessage.includes('API key')) {
        localStorage.removeItem('gemini-api-key')
        throw new Error('Invalid API key. Please try again.')
      }

      // Other errors - try next model
      if (modelIndex < GEMINI_MODELS.length - 1) {
        return callGeminiAPI(apiKey, prompt, modelIndex + 1, retryCount)
      }

      throw new Error(errorMessage || 'Failed to generate nicknames')
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Try multiple parsing strategies

    // Strategy 1: Find JSON array in response
    const jsonMatch = text.match(/\[[\s\S]*?\]/)
    if (jsonMatch) {
      try {
        const names = JSON.parse(jsonMatch[0])
        if (Array.isArray(names) && names.length > 0) {
          return names.filter((n: unknown): n is string => typeof n === 'string')
        }
      } catch {
        // JSON parse failed, try other strategies
      }
    }

    // Strategy 2: Parse numbered list (1. Name, 2. Name, etc.)
    const numberedMatches = text.match(/\d+\.\s*["']?(\w+)["']?/g)
    if (numberedMatches && numberedMatches.length > 0) {
      const names = numberedMatches.map((m: string) => {
        const match = m.match(/\d+\.\s*["']?(\w+)["']?/)
        return match ? match[1] : ''
      }).filter((n: string) => n.length > 0)
      if (names.length > 0) return names
    }

    // Strategy 3: Parse bullet list (- Name or * Name)
    const bulletMatches = text.match(/[-*]\s*["']?(\w+)["']?/g)
    if (bulletMatches && bulletMatches.length > 0) {
      const names = bulletMatches.map((m: string) => {
        const match = m.match(/[-*]\s*["']?(\w+)["']?/)
        return match ? match[1] : ''
      }).filter((n: string) => n.length > 0)
      if (names.length > 0) return names
    }

    // Strategy 4: Parse quoted strings
    const quotedMatches = text.match(/["']([^"']+)["']/g)
    if (quotedMatches && quotedMatches.length > 0) {
      const names = quotedMatches.map((m: string) => m.replace(/["']/g, '')).filter((n: string) => n.length > 0 && n.length <= 12)
      if (names.length > 0) return names
    }

    // Strategy 5: Split by newlines and filter for nickname-like strings
    const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0 && l.length <= 15 && /^[A-Za-z]+$/.test(l))
    if (lines.length > 0) return lines.slice(0, 5)

    throw new Error('Could not parse nickname response. Please try again.')
  } catch (error) {
    // Network errors - retry with backoff
    if (error instanceof TypeError && retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      return callGeminiAPI(apiKey, prompt, modelIndex, retryCount + 1)
    }
    throw error
  }
}

/**
 * Generate nicknames using Gemini API
 */
async function generateNicknames() {
  if (!state.selectedPokemon) {
    state.error = 'Please select a Pokémon first'
    renderResults()
    return
  }

  if (!state.style) {
    state.error = 'Please select a nickname style'
    renderResults()
    return
  }

  if (!state.length) {
    state.error = 'Please select a name length'
    renderResults()
    return
  }

  if (state.useTypes === null) {
    state.error = 'Please select whether to reference types'
    renderResults()
    return
  }

  // Get API key from localStorage or prompt user
  let apiKey = localStorage.getItem('gemini-api-key')
  if (!apiKey) {
    apiKey = prompt('Enter your Gemini API key:')
    if (!apiKey) {
      state.error = 'API key required to generate nicknames'
      renderResults()
      return
    }
    localStorage.setItem('gemini-api-key', apiKey)
  }

  state.isLoading = true
  state.error = null
  renderResults()

  const pokemon = state.selectedPokemon
  const name = getFullDisplayName(pokemon)
  const types = pokemon.types.map(t => toTitleCaseType(t)).join('/')

  // Build the prompt - style and length are guaranteed non-null due to validation above
  const lengthGuide: Record<string, string> = {
    short: '3-5 characters (single short words)',
    medium: '6-8 characters (single words or simple combos)',
    long: '9-12 characters - USE VARIED FORMATS: single longer words, mythological names, creative spellings, or nature-inspired names. AVOID compound CamelCase words like "FlameKnight" or "BlossomBoy"'
  }

  const styleGuide: Record<string, string> = {
    cool: 'badass, intimidating, powerful',
    cute: 'adorable, sweet, endearing',
    funny: 'punny, humorous, silly wordplay',
    mythical: 'legendary, epic, divine'
  }

  const typeContext = state.useTypes
    ? `The names should reference or be inspired by the Pokémon's ${types} typing.`
    : `The names should be type-neutral and not reference specific elements.`

  // Build format guidance for long names
  const formatGuidance = state.length === 'long'
    ? `\n- IMPORTANT: Vary the name formats! Include: single elegant words (Prometheus, Seraphina), creative spellings (Zephyros, Drakonis), nature words (Avalanche, Obsidian), or mythological references. Do NOT make all names TwoWordCompound style.`
    : ''

  const aiPrompt = `Generate 5 creative nicknames for a Pokémon named ${name} (${types} type).

Requirements:
- Style: ${styleGuide[state.style!]}
- Length: ${lengthGuide[state.length!]}
- ${typeContext}
- Must be game-appropriate (no profanity)
- Each nickname should be unique and creative
- Consider the Pokémon's appearance and characteristics${formatGuidance}

Return ONLY a JSON array of 5 nickname strings, no explanation. Example: ["Nick1", "Nick2", "Nick3", "Nick4", "Nick5"]`

  try {
    state.generatedNames = await callGeminiAPI(apiKey, aiPrompt)
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Failed to generate nicknames'
    console.error('Nickname generation error:', error)
  }

  state.isLoading = false
  renderResults()
}

/**
 * Render the results section
 */
function renderResults() {
  const container = document.getElementById('results-section')
  if (!container) return

  if (state.isLoading) {
    container.innerHTML = `
      <div class="card">
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-poke-blue mb-4"></div>
          <p class="text-gray-600">Generating creative nicknames...</p>
        </div>
      </div>
    `
    return
  }

  if (state.error) {
    container.innerHTML = `
      <div class="card border-red-200 bg-red-50">
        <div class="text-center py-6">
          <i class="ph-fill ph-warning text-4xl text-red-500 mb-2"></i>
          <p class="text-red-600">${state.error}</p>
          <button id="retry-btn" class="mt-4 text-poke-blue hover:underline">Try Again</button>
        </div>
      </div>
    `
    document.getElementById('retry-btn')?.addEventListener('click', generateNicknames)
    return
  }

  if (state.generatedNames.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="text-center py-8 text-gray-400">
          <i class="ph-fill ph-sparkle text-5xl mb-2"></i>
          <p>Generated nicknames will appear here</p>
        </div>
      </div>
    `
    return
  }

  container.innerHTML = `
    <div class="card">
      <h2 class="font-semibold text-gray-800 mb-4">Generated Nicknames</h2>
      <div class="space-y-2">
        ${state.generatedNames.map(name => {
          const isFavorite = state.favorites.includes(name)
          return `
            <div class="flex items-center justify-between p-3 bg-poke-light-gray rounded-lg">
              <span class="font-medium">${name}</span>
              <div class="flex gap-2">
                <button class="copy-btn text-gray-400 hover:text-poke-blue transition" data-name="${name}" title="Copy to clipboard">
                  <i class="ph-fill ph-clipboard text-xl"></i>
                </button>
                <button class="fav-btn transition ${isFavorite ? 'text-poke-yellow' : 'text-gray-400 hover:text-poke-yellow'}" data-name="${name}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                  <i class="ph-fill ph-star text-xl"></i>
                </button>
              </div>
            </div>
          `
        }).join('')}
      </div>
      <button id="regenerate-btn" class="w-full mt-4 text-poke-blue font-medium py-2 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-2">
        <i class="ph-fill ph-arrows-clockwise"></i>
        Regenerate
      </button>
    </div>
  `

  // Attach copy handlers
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.getAttribute('data-name') || ''
      await navigator.clipboard.writeText(name)

      // Visual feedback
      const icon = btn.querySelector('i')
      if (icon) {
        icon.className = 'ph-fill ph-check text-xl'
        btn.classList.add('text-green-500')
        setTimeout(() => {
          icon.className = 'ph-fill ph-clipboard text-xl'
          btn.classList.remove('text-green-500')
        }, 1500)
      }
    })
  })

  // Attach favorite handlers
  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || ''
      toggleFavorite(name)
    })
  })

  // Regenerate handler
  document.getElementById('regenerate-btn')?.addEventListener('click', generateNicknames)
}

/**
 * Toggle favorite status for a nickname
 */
function toggleFavorite(name: string) {
  const index = state.favorites.indexOf(name)
  if (index === -1) {
    state.favorites.push(name)
  } else {
    state.favorites.splice(index, 1)
  }
  localStorage.setItem('nickname-favorites', JSON.stringify(state.favorites))
  renderResults()
  renderFavorites()
}

/**
 * Render favorites section
 */
function renderFavorites() {
  const container = document.getElementById('favorites-section')
  if (!container) return

  if (state.favorites.length === 0) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="card mt-4">
      <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i class="ph-fill ph-star text-poke-yellow"></i>
        Favorites
      </h2>
      <div class="space-y-2">
        ${state.favorites.map(name => `
          <div class="flex items-center justify-between p-3 bg-poke-light-gray rounded-lg">
            <span class="font-medium">${name}</span>
            <div class="flex gap-2">
              <button class="copy-fav-btn text-gray-400 hover:text-poke-blue transition" data-name="${name}" title="Copy to clipboard">
                <i class="ph-fill ph-clipboard text-xl"></i>
              </button>
              <button class="remove-fav-btn text-poke-yellow hover:text-red-500 transition" data-name="${name}" title="Remove from favorites">
                <i class="ph-fill ph-star text-xl"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  // Attach copy handlers
  container.querySelectorAll('.copy-fav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.getAttribute('data-name') || ''
      await navigator.clipboard.writeText(name)

      const icon = btn.querySelector('i')
      if (icon) {
        icon.className = 'ph-fill ph-check text-xl'
        btn.classList.add('text-green-500')
        setTimeout(() => {
          icon.className = 'ph-fill ph-clipboard text-xl'
          btn.classList.remove('text-green-500')
        }, 1500)
      }
    })
  })

  // Attach remove handlers
  container.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || ''
      toggleFavorite(name)
    })
  })
}

/**
 * Render the full generator UI
 */
function renderGenerator() {
  const container = document.getElementById('nickname-generator-content')
  if (!container) return

  container.innerHTML = `
    <!-- Step 1: Select Pokémon -->
    <section class="card mb-4">
      <h2 class="font-semibold text-gray-800 mb-3">1. Select Your Pokémon</h2>
      <div id="search-container" class="relative">
        <input type="text" id="pokemon-search" placeholder="Search Pokémon..."
          class="w-full p-3 border-2 border-poke-gray rounded-lg focus:border-poke-blue focus:outline-none">
        <div id="search-results" class="hidden absolute z-10 w-full mt-1 bg-white border-2 border-poke-gray rounded-lg shadow-lg max-h-64 overflow-y-auto"></div>
      </div>
      <div id="selected-pokemon" class="mt-3 p-3 bg-poke-light-gray rounded-lg">
        <div class="text-gray-400 text-center py-4">
          <i class="ph-fill ph-question text-4xl mb-2"></i>
          <p>Select a Pokémon above</p>
        </div>
      </div>
    </section>

    <!-- Step 2: Name Style -->
    <section class="card mb-4">
      <h2 class="font-semibold text-gray-800 mb-3">2. What style of nickname?</h2>
      <div class="grid grid-cols-2 gap-2">
        <button data-style="cool" class="style-btn p-3 border-2 ${state.style === 'cool' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg text-left transition hover:shadow-md">
          <span class="font-medium ${state.style === 'cool' ? 'text-poke-blue' : ''}">Cool</span>
          <p class="text-xs text-gray-500 mt-1">Badass, intimidating</p>
        </button>
        <button data-style="cute" class="style-btn p-3 border-2 ${state.style === 'cute' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg text-left transition hover:shadow-md">
          <span class="font-medium ${state.style === 'cute' ? 'text-poke-blue' : ''}">Cute</span>
          <p class="text-xs text-gray-500 mt-1">Adorable, sweet</p>
        </button>
        <button data-style="funny" class="style-btn p-3 border-2 ${state.style === 'funny' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg text-left transition hover:shadow-md">
          <span class="font-medium ${state.style === 'funny' ? 'text-poke-blue' : ''}">Funny</span>
          <p class="text-xs text-gray-500 mt-1">Puns, jokes</p>
        </button>
        <button data-style="mythical" class="style-btn p-3 border-2 ${state.style === 'mythical' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg text-left transition hover:shadow-md">
          <span class="font-medium ${state.style === 'mythical' ? 'text-poke-blue' : ''}">Mythical</span>
          <p class="text-xs text-gray-500 mt-1">Legendary, epic</p>
        </button>
      </div>
    </section>

    <!-- Step 3: Type Reference -->
    <section class="card mb-4">
      <h2 class="font-semibold text-gray-800 mb-3">3. Reference Pokémon's type?</h2>
      <div class="space-y-2">
        <button data-use-types="true" class="type-btn w-full p-3 border-2 ${state.useTypes === true ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg text-left flex items-center justify-between transition hover:shadow-md">
          <div>
            <span class="font-medium ${state.useTypes === true ? 'text-poke-blue' : ''}">Yes, use types</span>
            <p class="text-xs text-gray-500 mt-1">Type-themed names</p>
          </div>
          ${state.useTypes === true ? '<i class="ph-fill ph-check-circle text-poke-blue text-xl"></i>' : ''}
        </button>
        <button data-use-types="false" class="type-btn w-full p-3 border-2 ${state.useTypes === false ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg text-left flex items-center justify-between transition hover:shadow-md">
          <div>
            <span class="font-medium ${state.useTypes === false ? 'text-poke-blue' : ''}">No, keep it general</span>
            <p class="text-xs text-gray-500 mt-1">Type-neutral names</p>
          </div>
          ${state.useTypes === false ? '<i class="ph-fill ph-check-circle text-poke-blue text-xl"></i>' : ''}
        </button>
      </div>
    </section>

    <!-- Step 4: Name Length -->
    <section class="card mb-4">
      <h2 class="font-semibold text-gray-800 mb-3">4. Preferred length?</h2>
      <div class="flex gap-2">
        <button data-length="short" class="length-btn flex-1 p-3 border-2 ${state.length === 'short' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg transition hover:shadow-md">
          <span class="font-medium ${state.length === 'short' ? 'text-poke-blue' : ''}">Short</span>
          <p class="text-xs text-gray-500">3-5 chars</p>
        </button>
        <button data-length="medium" class="length-btn flex-1 p-3 border-2 ${state.length === 'medium' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg transition hover:shadow-md">
          <span class="font-medium ${state.length === 'medium' ? 'text-poke-blue' : ''}">Medium</span>
          <p class="text-xs text-gray-500">6-8 chars</p>
        </button>
        <button data-length="long" class="length-btn flex-1 p-3 border-2 ${state.length === 'long' ? 'border-poke-blue bg-blue-50' : 'border-gray-200'} rounded-lg transition hover:shadow-md">
          <span class="font-medium ${state.length === 'long' ? 'text-poke-blue' : ''}">Long</span>
          <p class="text-xs text-gray-500">9-12 chars</p>
        </button>
      </div>
    </section>

    <!-- Generate Button -->
    <button id="generate-btn" class="btn btn-primary w-full py-4 text-lg mb-4">
      <i class="ph-fill ph-sparkle mr-2"></i>
      Generate Nicknames
    </button>

    <!-- Results Section -->
    <div id="results-section">
      <div class="card">
        <div class="text-center py-8 text-gray-400">
          <i class="ph-fill ph-sparkle text-5xl mb-2"></i>
          <p>Generated nicknames will appear here</p>
        </div>
      </div>
    </div>

    <!-- Favorites Section -->
    <div id="favorites-section"></div>
  `

  // Set up event listeners for the newly rendered elements
  setupElementListeners()

  // Render favorites if any exist
  renderFavorites()
}
