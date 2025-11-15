import './style.css'
import { initCalculator } from './calculator'
import { initPokedex } from './pokedex'

// Navigation handler
function navigateTo(pageId: string) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active')
  })

  // Show target page
  const targetPage = document.getElementById(`page-${pageId}`)
  if (targetPage) {
    targetPage.classList.add('active')
  }

  // Update nav buttons
  document.querySelectorAll('.nav-button, .top-nav-button').forEach(button => {
    button.classList.remove('active')
  })

  document.querySelectorAll(`[data-page="${pageId}"]`).forEach(button => {
    button.classList.add('active')
  })
}

// Pokéball SVG
const pokeballSVG = `
<svg class="pokeball-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="white" stroke="#333" stroke-width="2"/>
  <path d="M50 2C23.49 2 2 23.49 2 50H98C98 23.49 76.51 2 50 2Z" fill="#EF5350"/>
  <circle cx="50" cy="50" r="18" stroke="#333" stroke-width="4" fill="none"/>
  <circle cx="50" cy="50" r="10" fill="white" stroke="#333" stroke-width="2"/>
  <line x1="2" y1="50" x2="32" y2="50" stroke="#333" stroke-width="4"/>
  <line x1="68" y1="50" x2="98" y2="50" stroke="#333" stroke-width="4"/>
</svg>
`

// Main app HTML
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- App Header -->
  <header class="app-header">
    <div class="flex items-center gap-3">
      ${pokeballSVG}
      <h1 class="text-xl md:text-2xl font-bold">Pokémon Tool Kit</h1>
    </div>

    <!-- Desktop Navigation -->
    <nav class="top-nav">
      <button class="top-nav-button active" data-page="home">
        <i class="ph-fill ph-house text-lg"></i>
        <span class="ml-2">Home</span>
      </button>
      <button class="top-nav-button" data-page="calculator">
        <i class="ph-fill ph-calculator text-lg"></i>
        <span class="ml-2">Calculator</span>
      </button>
      <button class="top-nav-button" data-page="pokedex">
        <i class="ph-fill ph-list-dashes text-lg"></i>
        <span class="ml-2">Pokédex</span>
      </button>
      <button class="top-nav-button" data-page="teams">
        <i class="ph-fill ph-users-three text-lg"></i>
        <span class="ml-2">Team Builder</span>
      </button>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Home Page -->
    <div id="page-home" class="page active">
      <div class="mb-8">
        <h2 class="text-3xl md:text-4xl font-bold text-poke-dark mb-2">Welcome, Trainer!</h2>
        <p class="text-gray-600">Your essential Pokémon companion for types, teams, and trades.</p>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h3 class="text-xl font-semibold mb-4 text-poke-blue">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button class="quick-action-btn" data-page="calculator">
            <i class="ph-fill ph-calculator text-5xl text-poke-blue mb-2"></i>
            <span class="font-medium">Type Calculator</span>
          </button>
          <button class="quick-action-btn" data-page="pokedex">
            <i class="ph-fill ph-list-dashes text-5xl text-poke-blue mb-2"></i>
            <span class="font-medium">Pokédex</span>
          </button>
          <button class="quick-action-btn" data-page="teams">
            <i class="ph-fill ph-users-three text-5xl text-poke-blue mb-2"></i>
            <span class="font-medium">Team Builder</span>
          </button>
          <button class="quick-action-btn opacity-50 cursor-not-allowed">
            <i class="ph-fill ph-link text-5xl text-gray-400 mb-2"></i>
            <span class="font-medium text-gray-400">Trading (Soon)</span>
          </button>
        </div>
      </div>

      <!-- Recent News -->
      <div class="card">
        <h3 class="text-xl font-semibold mb-4 text-poke-blue">Recent News</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4 p-3 bg-poke-light-gray rounded-lg">
            <div class="w-16 h-16 bg-poke-red rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S/V
            </div>
            <div>
              <h4 class="font-semibold mb-1">New Tera Raid Battle Event!</h4>
              <p class="text-sm text-gray-600">A new 7-Star raid is now live in Pokémon Scarlet & Violet.</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-3 bg-poke-light-gray rounded-lg">
            <div class="w-16 h-16 bg-poke-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
              Sw/Sh
            </div>
            <div>
              <h4 class="font-semibold mb-1">Sword & Shield Servers</h4>
              <p class="text-sm text-gray-600">Online services remain active. Trading is a go!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calculator Page -->
    <div id="page-calculator" class="page">
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-poke-dark mb-2">Type Calculator</h2>
        <p class="text-gray-600">Calculate defensive type matchups and find the best type combinations.</p>
      </div>

<div class="card">
        <h3 class="text-lg font-semibold mb-4">Select Types</h3>
        <p class="text-sm text-gray-600 mb-4">Click type badges to select your Pokémon's defensive typing.</p>

        <!-- Type 1 Selector -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-700">Type 1 (Required)</label>
            <button id="clear-type1" class="text-sm text-poke-blue hover:underline" style="display: none;">Clear</button>
          </div>
          <div id="type1-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"></div>
        </div>

        <!-- Type 2 Selector -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-700">Type 2 (Optional)</label>
            <button id="clear-type2" class="text-sm text-poke-blue hover:underline" style="display: none;">Clear</button>
          </div>
          <div id="type2-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"></div>
        </div>

        <button id="calculate-btn" class="btn btn-primary w-full">Calculate Matchups</button>
      </div>

      <!-- Results Container -->
      <div id="results-container"></div>
    </div>

    <!-- Pokédex Page -->
    <div id="page-pokedex" class="page">
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-poke-dark mb-2">Pokédex</h2>
        <p class="text-gray-600">Browse all Pokémon with stats, types, and detailed information.</p>
      </div>

      <!-- Search and Filters -->
      <div class="card mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label class="text-sm font-medium text-gray-700 mb-2 block">Search Pokémon</label>
            <input
              type="text"
              id="pokedex-search"
              placeholder="Search by name or number..."
              class="w-full px-4 py-2 border-2 border-poke-gray rounded-lg focus:border-poke-blue focus:outline-none"
            />
          </div>

          <!-- Type Filter -->
          <div class="w-full md:w-48">
            <label class="text-sm font-medium text-gray-700 mb-2 block">Filter by Type</label>
            <select id="pokedex-type-filter" class="w-full px-4 py-2 border-2 border-poke-gray rounded-lg focus:border-poke-blue focus:outline-none">
              <option value="">All Types</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="w-full md:w-48">
            <label class="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
            <select id="pokedex-sort" class="w-full px-4 py-2 border-2 border-poke-gray rounded-lg focus:border-poke-blue focus:outline-none">
              <option value="number">Pokédex #</option>
              <option value="name">Name (A-Z)</option>
              <option value="hp">HP (High-Low)</option>
              <option value="attack">Attack (High-Low)</option>
              <option value="defense">Defense (High-Low)</option>
              <option value="speed">Speed (High-Low)</option>
              <option value="total">Total Stats (High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pokémon Grid -->
      <div id="pokemon-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <!-- Pokémon cards will be inserted here by JavaScript -->
      </div>

      <!-- Loading State -->
      <div id="pokedex-loading" class="card text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-poke-blue mb-4"></div>
        <p class="text-gray-600">Loading Pokédex...</p>
      </div>

      <!-- Empty State -->
      <div id="pokedex-empty" class="card text-center py-12" style="display: none;">
        <i class="ph-fill ph-magnifying-glass text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600">No Pokémon found matching your search.</p>
      </div>
    </div>

    <!-- Team Builder Page -->
    <div id="page-teams" class="page">
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-poke-dark mb-2">Team Builder</h2>
        <p class="text-gray-600">Get team recommendations for campaign, competitive, or raid battles.</p>
      </div>

      <div class="card">
        <p class="text-center text-gray-500">Team builder coming soon...</p>
      </div>
    </div>
  </main>

  <!-- Bottom Navigation (Mobile) -->
  <nav class="bottom-nav">
    <button class="nav-button active" data-page="home">
      <i class="ph-fill ph-house text-2xl mb-1"></i>
      <span>Home</span>
    </button>
    <button class="nav-button" data-page="calculator">
      <i class="ph-fill ph-calculator text-2xl mb-1"></i>
      <span>Calculator</span>
    </button>
    <button class="nav-button" data-page="pokedex">
      <i class="ph-fill ph-list-dashes text-2xl mb-1"></i>
      <span>Pokédex</span>
    </button>
    <button class="nav-button" data-page="teams">
      <i class="ph-fill ph-users-three text-2xl mb-1"></i>
      <span>Teams</span>
    </button>
  </nav>
`

// Attach navigation listeners
document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    const pageId = button.getAttribute('data-page')
    if (pageId) navigateTo(pageId)
  })
})

// Add quick action button styles
const style = document.createElement('style')
style.textContent = `
  .quick-action-btn {
    @apply flex flex-col items-center justify-center p-6 bg-poke-light-gray rounded-xl hover:bg-poke-gray transition cursor-pointer text-center;
  }
`
document.head.appendChild(style)

// Initialize calculator and pokédex after DOM is ready
initCalculator()
initPokedex()
