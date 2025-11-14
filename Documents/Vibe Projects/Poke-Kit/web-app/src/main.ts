import './style.css'

// Router state
let currentPage = 'home'

// Navigation handler
function navigateTo(pageId: string) {
  currentPage = pageId

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
      <button class="top-nav-button" data-page="teams">
        <i class="ph-fill ph-users-three text-lg"></i>
        <span class="ml-2">Team Builder</span>
      </button>
      <button class="top-nav-button" data-page="trading">
        <i class="ph-fill ph-arrows-clockwise text-lg"></i>
        <span class="ml-2">Trading</span>
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
          <button class="quick-action-btn" data-page="teams">
            <i class="ph-fill ph-users-three text-5xl text-poke-blue mb-2"></i>
            <span class="font-medium">Team Builder</span>
          </button>
          <button class="quick-action-btn" data-page="trading">
            <i class="ph-fill ph-arrows-clockwise text-5xl text-poke-blue mb-2"></i>
            <span class="font-medium">GTS Trading</span>
          </button>
          <button class="quick-action-btn opacity-50 cursor-not-allowed">
            <i class="ph-fill ph-map-trifold text-5xl text-gray-400 mb-2"></i>
            <span class="font-medium text-gray-400">Pokédex (Soon)</span>
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
        <p class="text-sm text-gray-600 mb-4">Select your Pokémon's type(s) to see defensive weaknesses, resistances, and immunities.</p>

        <div class="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type 1</label>
            <select id="type1" class="select-input">
              <option value="">Select Type 1</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type 2 (Optional)</label>
            <select id="type2" class="select-input">
              <option value="">None</option>
            </select>
          </div>
        </div>

        <button id="calculate-btn" class="btn btn-primary w-full">Calculate</button>
      </div>

      <!-- Results Container -->
      <div id="results-container"></div>
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

    <!-- Trading Page -->
    <div id="page-trading" class="page">
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-poke-dark mb-2">Global Trade Station</h2>
        <p class="text-gray-600">Browse and post trade offers with the Pokémon community.</p>
      </div>

      <div class="card">
        <p class="text-center text-gray-500">Trading hub coming soon...</p>
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
    <button class="nav-button" data-page="teams">
      <i class="ph-fill ph-users-three text-2xl mb-1"></i>
      <span>Teams</span>
    </button>
    <button class="nav-button" data-page="trading">
      <i class="ph-fill ph-arrows-clockwise text-2xl mb-1"></i>
      <span>Trading</span>
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
