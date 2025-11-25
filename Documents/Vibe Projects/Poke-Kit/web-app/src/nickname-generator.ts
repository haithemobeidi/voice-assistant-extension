// nickname-generator.ts
// AI-powered nickname generator using Google Gemini API
// Redesigned with new gamer aesthetic UI

import type { PokemonCreature } from './types/pokemon';
import { toTitleCaseType } from './types/pokemon';
import { getTypeConfig } from './shared/typeConfig';
import pokemonData from './data/pokemon.json';

// Declare lucide global (loaded via CDN)
declare const lucide: {
  createIcons: () => void;
};

/**
 * Get the full display name for a Pokémon including form name
 */
function getFullDisplayName(pokemon: PokemonCreature): string {
  if (pokemon.formNames && pokemon.formNames.en) {
    return pokemon.formNames.en;
  }
  return pokemon.speciesNames.en || pokemon.name;
}

/**
 * Get HD official artwork URL for a Pokémon
 */
function getSpriteUrl(pokemon: PokemonCreature): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
}

// Types for nickname generation
export type NicknameStyle = 'cool' | 'cute' | 'funny' | 'mythical' | null;
export type NameLength = 'short' | 'medium' | 'long' | null;

interface NicknameState {
  selectedPokemon: PokemonCreature | null;
  style: NicknameStyle;
  useTypes: boolean | null;
  length: NameLength;
  generatedNames: string[];
  favorites: string[];
  isLoading: boolean;
  error: string | null;
}

// Default state factory
function createDefaultState(): NicknameState {
  return {
    selectedPokemon: null,
    style: null,
    useTypes: null,
    length: null,
    generatedNames: [],
    favorites: JSON.parse(localStorage.getItem('nickname-favorites') || '[]'),
    isLoading: false,
    error: null
  };
}

/**
 * Cleanup function - called when navigating away
 */
export function cleanupNicknameGenerator(): void {
  state = createDefaultState();
  const container = document.getElementById('nickname-generator-content');
  if (container) {
    container.innerHTML = '';
  }
}

// Global state
let state: NicknameState = createDefaultState();
const allPokemon = pokemonData as PokemonCreature[];
const LISTENER_ATTR = 'data-nickname-listeners-attached';

/**
 * Initialize the nickname generator
 */
export function initNicknameGenerator(): void {
  state = createDefaultState();
  const container = document.getElementById('nickname-generator-content');
  if (container) {
    container.innerHTML = '';
  }
  renderGenerator();

  if (!document.body.hasAttribute(LISTENER_ATTR)) {
    setupGlobalListeners();
    document.body.setAttribute(LISTENER_ATTR, 'true');
  }
}

/**
 * Set up global document-level listeners
 */
function setupGlobalListeners(): void {
  document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer && !searchContainer.contains(e.target as Node)) {
      hideSearchResults();
    }
  });
}

/**
 * Set up element-specific event listeners
 */
function setupElementListeners(): void {
  const searchInput = document.getElementById('pokemon-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', handlePokemonSearch);
    searchInput.addEventListener('focus', () => showSearchResults());
  }

  document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      setStyle(btn.getAttribute('data-style') as NicknameStyle);
    });
  });

  document.querySelectorAll('[data-use-types]').forEach(btn => {
    btn.addEventListener('click', () => {
      setUseTypes(btn.getAttribute('data-use-types') === 'true');
    });
  });

  document.querySelectorAll('[data-length]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLength(btn.getAttribute('data-length') as NameLength);
    });
  });

  document.getElementById('generate-btn')?.addEventListener('click', generateNicknames);
}

/**
 * Handle Pokemon search input
 */
function handlePokemonSearch(e: Event): void {
  const query = (e.target as HTMLInputElement).value.toLowerCase();
  if (query.length < 2) {
    hideSearchResults();
    return;
  }

  const matches = allPokemon
    .filter(p => {
      const fullName = getFullDisplayName(p).toLowerCase();
      const speciesName = (p.speciesNames.en || '').toLowerCase();
      const internalName = p.name.toLowerCase();
      const numStr = p.number.toString();

      return fullName.includes(query) ||
             speciesName.includes(query) ||
             internalName.includes(query) ||
             numStr.includes(query);
    })
    .slice(0, 10);

  renderSearchResults(matches);
}

/**
 * Render search results dropdown
 */
function renderSearchResults(pokemon: PokemonCreature[]): void {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (pokemon.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-3 text-gray-500 dark:text-gray-400 text-center">No Pokémon found</div>
    `;
  } else {
    resultsContainer.innerHTML = pokemon.map(p => {
      const name = getFullDisplayName(p);
      const types = p.types.map(t => toTitleCaseType(t));
      const spriteUrl = getSpriteUrl(p);

      return `
        <button class="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                data-pokemon-id="${p.id}">
          <img src="${spriteUrl}" alt="${name}" class="w-12 h-12 object-contain">
          <div class="text-left">
            <p class="font-bold text-gray-900 dark:text-white">${name}</p>
            <div class="flex gap-1">
              ${types.map(t => {
                const config = getTypeConfig(t);
                return `<span class="text-xs px-2 py-0.5 rounded-full text-white" style="background-color: ${config.color}">${t}</span>`;
              }).join('')}
            </div>
          </div>
        </button>
      `;
    }).join('');
  }

  resultsContainer.classList.remove('hidden');
  lucide.createIcons();

  resultsContainer.querySelectorAll('[data-pokemon-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-pokemon-id') || '';
      selectPokemonById(id);
    });
  });
}

function showSearchResults(): void {
  const query = (document.getElementById('pokemon-search') as HTMLInputElement)?.value;
  if (query && query.length >= 2) {
    handlePokemonSearch({ target: { value: query } } as unknown as Event);
  }
}

function hideSearchResults(): void {
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.classList.add('hidden');
  }
}

function selectPokemonById(id: string): void {
  const pokemon = allPokemon.find(p => p.id === id);
  if (pokemon) {
    state.selectedPokemon = pokemon;
    hideSearchResults();
    const searchInput = document.getElementById('pokemon-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    renderSelectedPokemon();
  }
}

/**
 * Render selected Pokemon preview (redesigned)
 */
function renderSelectedPokemon(): void {
  const container = document.getElementById('selected-pokemon');
  if (!container) return;

  if (!state.selectedPokemon) {
    container.innerHTML = `
      <div class="text-gray-400 dark:text-gray-500 text-center py-6">
        <i data-lucide="circle-help" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p>Select a Pokémon above</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const p = state.selectedPokemon;
  const name = getFullDisplayName(p);
  const types = p.types.map(t => toTitleCaseType(t));
  const spriteUrl = getSpriteUrl(p);

  container.innerHTML = `
    <div class="flex items-center gap-4 p-4 border-2 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700">
      <img src="${spriteUrl}" alt="${name}" class="w-16 h-16 object-contain">
      <div>
        <h3 class="font-bold text-lg text-gray-900 dark:text-white">${name}</h3>
        <div class="flex gap-1 mt-1">
          ${types.map(t => {
            const tc = getTypeConfig(t);
            return `<span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${tc.color}">${t}</span>`;
          }).join('')}
        </div>
      </div>
      <button id="change-pokemon" class="ml-auto text-sm text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-200 transition">
        Change
      </button>
    </div>
  `;

  lucide.createIcons();

  document.getElementById('change-pokemon')?.addEventListener('click', () => {
    state.selectedPokemon = null;
    renderSelectedPokemon();
  });
}

function setStyle(style: NicknameStyle): void {
  state.style = style;
  updateStyleButtons();
}

function updateStyleButtons(): void {
  document.querySelectorAll('[data-style]').forEach(btn => {
    const style = btn.getAttribute('data-style') as NicknameStyle;
    const isActive = style === state.style;
    btn.classList.toggle('border-blue-500', isActive);
    btn.classList.toggle('bg-blue-50', isActive);
    btn.classList.toggle('dark:bg-blue-500/20', isActive);
    btn.classList.toggle('text-blue-600', isActive);
    btn.classList.toggle('dark:text-blue-400', isActive);
    btn.classList.toggle('border-gray-200', !isActive);
    btn.classList.toggle('dark:border-gray-700', !isActive);
    btn.classList.toggle('text-gray-600', !isActive);
    btn.classList.toggle('dark:text-gray-400', !isActive);
  });
}

function setUseTypes(useTypes: boolean): void {
  state.useTypes = useTypes;
  updateTypeButtons();
}

function updateTypeButtons(): void {
  document.querySelectorAll('[data-use-types]').forEach(btn => {
    const btnValue = btn.getAttribute('data-use-types') === 'true';
    const isActive = state.useTypes !== null && btnValue === state.useTypes;
    btn.classList.toggle('border-blue-500', isActive);
    btn.classList.toggle('bg-blue-50', isActive);
    btn.classList.toggle('dark:bg-blue-500/20', isActive);
    btn.classList.toggle('border-gray-200', !isActive);
    btn.classList.toggle('dark:border-gray-700', !isActive);
  });
}

function setLength(length: NameLength): void {
  state.length = length;
  updateLengthButtons();
}

function updateLengthButtons(): void {
  document.querySelectorAll('[data-length]').forEach(btn => {
    const length = btn.getAttribute('data-length') as NameLength;
    const isActive = length === state.length;
    btn.classList.toggle('border-blue-500', isActive);
    btn.classList.toggle('bg-blue-50', isActive);
    btn.classList.toggle('dark:bg-blue-500/20', isActive);
    btn.classList.toggle('text-blue-600', isActive);
    btn.classList.toggle('dark:text-blue-400', isActive);
    btn.classList.toggle('border-gray-200', !isActive);
    btn.classList.toggle('dark:border-gray-700', !isActive);
    btn.classList.toggle('text-gray-600', !isActive);
    btn.classList.toggle('dark:text-gray-400', !isActive);
  });
}

// Gemini API handling
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'];

async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  modelIndex = 0,
  retryCount = 0
): Promise<string[]> {
  const maxRetries = 2;
  const model = GEMINI_MODELS[modelIndex];

  if (!model) {
    throw new Error('All models are currently unavailable. Please try again later.');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 256 }
        })
      }
    );

    if (response.status === 503) {
      if (modelIndex < GEMINI_MODELS.length - 1) {
        return callGeminiAPI(apiKey, prompt, modelIndex + 1, retryCount);
      }
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return callGeminiAPI(apiKey, prompt, 0, retryCount + 1);
      }
      throw new Error('AI service is currently busy. Please try again in a few moments.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch { /* ignore */ }

      if (response.status === 400 && errorMessage.includes('API key')) {
        localStorage.removeItem('gemini-api-key');
        throw new Error('Invalid API key. Please try again.');
      }

      if (modelIndex < GEMINI_MODELS.length - 1) {
        return callGeminiAPI(apiKey, prompt, modelIndex + 1, retryCount);
      }
      throw new Error(errorMessage || 'Failed to generate nicknames');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const names = JSON.parse(jsonMatch[0]);
        if (Array.isArray(names) && names.length > 0) {
          return names.filter((n: unknown): n is string => typeof n === 'string');
        }
      } catch { /* try other parsers */ }
    }

    const numberedMatches = text.match(/\d+\.\s*["']?(\w+)["']?/g);
    if (numberedMatches && numberedMatches.length > 0) {
      const names = numberedMatches.map((m: string) => m.match(/\d+\.\s*["']?(\w+)["']?/)?.[1] || '').filter(Boolean);
      if (names.length > 0) return names;
    }

    const quotedMatches = text.match(/["']([^"']+)["']/g);
    if (quotedMatches && quotedMatches.length > 0) {
      const names = quotedMatches.map((m: string) => m.replace(/["']/g, '')).filter((n: string) => n.length > 0 && n.length <= 12);
      if (names.length > 0) return names;
    }

    throw new Error('Could not parse nickname response. Please try again.');
  } catch (error) {
    if (error instanceof TypeError && retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiAPI(apiKey, prompt, modelIndex, retryCount + 1);
    }
    throw error;
  }
}

async function generateNicknames(): Promise<void> {
  if (!state.selectedPokemon) {
    state.error = 'Please select a Pokémon first';
    renderResults();
    return;
  }
  if (!state.style) {
    state.error = 'Please select a nickname style';
    renderResults();
    return;
  }
  if (!state.length) {
    state.error = 'Please select a name length';
    renderResults();
    return;
  }
  if (state.useTypes === null) {
    state.error = 'Please select whether to reference types';
    renderResults();
    return;
  }

  let apiKey = localStorage.getItem('gemini-api-key');
  if (!apiKey) {
    apiKey = prompt('Enter your Gemini API key:');
    if (!apiKey) {
      state.error = 'API key required to generate nicknames';
      renderResults();
      return;
    }
    localStorage.setItem('gemini-api-key', apiKey);
  }

  state.isLoading = true;
  state.error = null;
  renderResults();

  const pokemon = state.selectedPokemon;
  const name = getFullDisplayName(pokemon);
  const types = pokemon.types.map(t => toTitleCaseType(t)).join('/');

  const lengthGuide: Record<string, string> = {
    short: '3-5 characters (single short words)',
    medium: '6-8 characters (single words or simple combos)',
    long: '9-12 characters - USE VARIED FORMATS: single longer words, mythological names, creative spellings, or nature-inspired names.'
  };

  const styleGuide: Record<string, string> = {
    cool: 'badass, intimidating, powerful',
    cute: 'adorable, sweet, endearing',
    funny: 'punny, humorous, silly wordplay',
    mythical: 'legendary, epic, divine'
  };

  const typeContext = state.useTypes
    ? `The names should reference or be inspired by the Pokémon's ${types} typing.`
    : `The names should be type-neutral and not reference specific elements.`;

  const aiPrompt = `Generate 5 creative nicknames for a Pokémon named ${name} (${types} type).

Requirements:
- Style: ${styleGuide[state.style!]}
- Length: ${lengthGuide[state.length!]}
- ${typeContext}
- Must be game-appropriate (no profanity)
- Each nickname should be unique and creative

Return ONLY a JSON array of 5 nickname strings, no explanation. Example: ["Nick1", "Nick2", "Nick3", "Nick4", "Nick5"]`;

  try {
    state.generatedNames = await callGeminiAPI(apiKey, aiPrompt);
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Failed to generate nicknames';
  }

  state.isLoading = false;
  renderResults();
}

/**
 * Render results section (redesigned)
 */
function renderResults(): void {
  const container = document.getElementById('results-section');
  if (!container) return;

  if (state.isLoading) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="spinner mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">Generating creative nicknames...</p>
      </div>
    `;
    return;
  }

  if (state.error) {
    container.innerHTML = `
      <div class="text-center py-8">
        <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-3"></i>
        <p class="text-red-600 dark:text-red-400 mb-4">${state.error}</p>
        <button id="retry-btn" class="text-blue-500 hover:underline font-medium">Try Again</button>
      </div>
    `;
    lucide.createIcons();
    document.getElementById('retry-btn')?.addEventListener('click', generateNicknames);
    return;
  }

  if (state.generatedNames.length === 0) {
    container.innerHTML = `
      <h3 class="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-4">Results</h3>
      <div class="text-center py-8 text-gray-400 dark:text-gray-500">
        <i data-lucide="sparkles" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p>Generated nicknames will appear here</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <h3 class="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-4">Results</h3>
    <div class="space-y-3">
      ${state.generatedNames.map(name => {
        const isFavorite = state.favorites.includes(name);
        return `
          <div class="result-item">
            <span class="name">${name}</span>
            <div class="flex gap-2">
              <button class="copy-btn" data-name="${name}" title="Copy to clipboard">
                <i data-lucide="copy" class="w-5 h-5"></i>
              </button>
              <button class="fav-btn ${isFavorite ? 'text-yellow-500' : ''}" data-name="${name}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <i data-lucide="${isFavorite ? 'star' : 'star'}" class="w-5 h-5 ${isFavorite ? 'fill-current' : ''}"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <button id="regenerate-btn" class="w-full mt-6 py-3 text-blue-500 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition flex items-center justify-center gap-2">
      <i data-lucide="refresh-cw" class="w-5 h-5"></i>
      Regenerate
    </button>
  `;

  lucide.createIcons();

  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.getAttribute('data-name') || '';
      await navigator.clipboard.writeText(name);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'check');
        lucide.createIcons();
        setTimeout(() => {
          icon.setAttribute('data-lucide', 'copy');
          lucide.createIcons();
        }, 1500);
      }
    });
  });

  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || '';
      toggleFavorite(name);
    });
  });

  document.getElementById('regenerate-btn')?.addEventListener('click', generateNicknames);
}

function toggleFavorite(name: string): void {
  const index = state.favorites.indexOf(name);
  if (index === -1) {
    state.favorites.push(name);
  } else {
    state.favorites.splice(index, 1);
  }
  localStorage.setItem('nickname-favorites', JSON.stringify(state.favorites));
  renderResults();
  renderFavorites();
}

function renderFavorites(): void {
  const container = document.getElementById('favorites-section');
  if (!container) return;

  if (state.favorites.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="mt-8">
      <h3 class="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
        <i data-lucide="star" class="w-4 h-4 text-yellow-500 fill-current"></i>
        Favorites
      </h3>
      <div class="space-y-3">
        ${state.favorites.map(name => `
          <div class="result-item">
            <span class="name">${name}</span>
            <div class="flex gap-2">
              <button class="copy-fav-btn copy-btn" data-name="${name}" title="Copy to clipboard">
                <i data-lucide="copy" class="w-5 h-5"></i>
              </button>
              <button class="remove-fav-btn text-yellow-500" data-name="${name}" title="Remove from favorites">
                <i data-lucide="star" class="w-5 h-5 fill-current"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  lucide.createIcons();

  container.querySelectorAll('.copy-fav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.getAttribute('data-name') || '';
      await navigator.clipboard.writeText(name);
    });
  });

  container.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name') || '';
      toggleFavorite(name);
    });
  });
}

/**
 * Render the full generator UI (redesigned)
 */
function renderGenerator(): void {
  const container = document.getElementById('nickname-generator-content');
  if (!container) return;

  container.innerHTML = `
    <div class="card space-y-8">
      <!-- Step 1: Select Pokémon -->
      <div>
        <label class="block text-sm font-bold mb-3 uppercase tracking-wide text-gray-500 dark:text-gray-400">
          1. Select Pokémon
        </label>
        <div id="search-container" class="relative mb-3">
          <i data-lucide="search" class="absolute left-3 top-3 text-gray-400 w-5 h-5"></i>
          <input
            type="text"
            id="pokemon-search"
            placeholder="Search Pokémon..."
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div id="search-results" class="hidden absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-64 overflow-y-auto"></div>
        </div>
        <div id="selected-pokemon">
          <div class="text-gray-400 dark:text-gray-500 text-center py-6">
            <i data-lucide="circle-help" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
            <p>Select a Pokémon above</p>
          </div>
        </div>
      </div>

      <!-- Step 2: Vibe & Style -->
      <div>
        <label class="block text-sm font-bold mb-3 uppercase tracking-wide text-gray-500 dark:text-gray-400">
          2. Vibe & Style
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button data-style="cool" class="selection-tile">
            <span class="icon">🕶️</span>
            <span class="label">Cool</span>
            <span class="desc">Edgy</span>
          </button>
          <button data-style="cute" class="selection-tile">
            <span class="icon">🎀</span>
            <span class="label">Cute</span>
            <span class="desc">Sweet</span>
          </button>
          <button data-style="funny" class="selection-tile">
            <span class="icon">😂</span>
            <span class="label">Funny</span>
            <span class="desc">Puns</span>
          </button>
          <button data-style="mythical" class="selection-tile">
            <span class="icon">✨</span>
            <span class="label">Mythic</span>
            <span class="desc">Epic</span>
          </button>
        </div>
      </div>

      <!-- Step 3: Type Reference -->
      <div>
        <label class="block text-sm font-bold mb-3 uppercase tracking-wide text-gray-500 dark:text-gray-400">
          3. Reference Type?
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button data-use-types="true" class="selection-tile">
            <span class="icon">🔥</span>
            <span class="label">Yes</span>
            <span class="desc">Type-themed</span>
          </button>
          <button data-use-types="false" class="selection-tile">
            <span class="icon">⭐</span>
            <span class="label">No</span>
            <span class="desc">General</span>
          </button>
        </div>
      </div>

      <!-- Step 4: Length -->
      <div>
        <label class="block text-sm font-bold mb-3 uppercase tracking-wide text-gray-500 dark:text-gray-400">
          4. Length
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button data-length="short" class="selection-tile">
            <span class="label">Short</span>
            <span class="desc">3-5 chars</span>
          </button>
          <button data-length="medium" class="selection-tile">
            <span class="label">Medium</span>
            <span class="desc">6-8 chars</span>
          </button>
          <button data-length="long" class="selection-tile">
            <span class="label">Long</span>
            <span class="desc">9-12 chars</span>
          </button>
        </div>
      </div>

      <!-- Generate Button -->
      <button id="generate-btn" class="btn-primary w-full">
        <i data-lucide="sparkles" class="w-5 h-5"></i>
        Generate Nicknames
      </button>
    </div>

    <!-- Results Section -->
    <div id="results-section" class="mt-8">
      <h3 class="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-4">Results</h3>
      <div class="text-center py-8 text-gray-400 dark:text-gray-500">
        <i data-lucide="sparkles" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
        <p>Generated nicknames will appear here</p>
      </div>
    </div>

    <!-- Favorites Section -->
    <div id="favorites-section"></div>
  `;

  lucide.createIcons();
  setupElementListeners();
  renderFavorites();
}
