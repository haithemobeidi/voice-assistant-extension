// main.ts
// Main entry point for the Pokémon Tool Kit app
// Handles navigation, page rendering, and initialization

import './style.css';
import { initCalculator } from './calculator';
import { initPokedex } from './pokedex';
import { initNicknameGenerator, cleanupNicknameGenerator } from './nickname-generator';
import { initTeamBuilder, cleanupTeamBuilder } from './team-builder';
import { initTheme, toggleTheme } from './shared/theme';
import { NavBar, QuickActionCard } from './shared/components';

// Declare lucide global (loaded via CDN)
declare const lucide: {
  createIcons: () => void;
};

// Valid page IDs for routing
const VALID_PAGES = ['home', 'calculator', 'pokedex', 'teams', 'nickname'] as const;
type PageId = typeof VALID_PAGES[number];

// Track current page for cleanup and nav state
let currentPage: PageId = 'home';

/**
 * Get page ID from URL hash
 * Returns 'home' if hash is empty or invalid
 */
function getPageFromHash(): PageId {
  const hash = window.location.hash.slice(1) as PageId;
  return VALID_PAGES.includes(hash) ? hash : 'home';
}

/**
 * Navigate to a specific page
 * Handles cleanup, page switching, and URL hash updates
 */
function navigateTo(pageId: PageId, updateHash = true): void {
  // Cleanup current page if needed
  if (currentPage === 'nickname') {
    cleanupNicknameGenerator();
  }
  if (currentPage === 'teams') {
    cleanupTeamBuilder();
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show target page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update navigation active states
  updateNavActiveStates(pageId);

  // Initialize page-specific modules
  if (pageId === 'nickname') {
    initNicknameGenerator();
  }
  if (pageId === 'teams') {
    initTeamBuilder();
  }

  // Update current page tracker
  currentPage = pageId;

  // Update URL hash
  if (updateHash && window.location.hash !== `#${pageId}`) {
    window.location.hash = pageId;
  }

  // Close mobile menu if open
  closeMobileMenu();

  // Re-create Lucide icons for the new page content
  lucide.createIcons();
}

/**
 * Update navigation link active states
 */
function updateNavActiveStates(activePageId: PageId): void {
  document.querySelectorAll('[data-nav]').forEach(link => {
    const linkPageId = link.getAttribute('data-nav');
    const isActive = linkPageId === activePageId;

    // Desktop nav links
    if (link.matches('.hidden.md\\:flex a, .md\\:flex a')) {
      link.classList.remove('bg-gray-900', 'text-white', 'dark:bg-white', 'dark:text-gray-900');
      link.classList.remove('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');

      if (isActive) {
        link.classList.add('bg-gray-900', 'text-white', 'dark:bg-white', 'dark:text-gray-900');
      } else {
        link.classList.add('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900',
          'dark:text-gray-400', 'dark:hover:bg-gray-800', 'dark:hover:text-white');
      }
    }

    // Mobile nav links
    if (link.hasAttribute('data-mobile-nav')) {
      link.classList.remove('bg-gray-100', 'text-gray-900', 'dark:bg-gray-800', 'dark:text-white');
      if (isActive) {
        link.classList.add('bg-gray-100', 'text-gray-900', 'dark:bg-gray-800', 'dark:text-white');
      }
    }
  });
}

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu(): void {
  const menu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-icon-open');
  const closeIcon = document.getElementById('menu-icon-close');

  if (menu && openIcon && closeIcon) {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    menu.classList.toggle('open', !isOpen);
    openIcon.classList.toggle('hidden', !isOpen);
    closeIcon.classList.toggle('hidden', isOpen);
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu(): void {
  const menu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-icon-open');
  const closeIcon = document.getElementById('menu-icon-close');

  if (menu) {
    menu.classList.add('hidden');
    menu.classList.remove('open');
  }
  if (openIcon) openIcon.classList.remove('hidden');
  if (closeIcon) closeIcon.classList.add('hidden');
}

/**
 * Generate the Home page content
 */
function renderHomePage(): string {
  const quickActions = [
    QuickActionCard('calculator', 'Calculator', 'Analyze matchups', 'calculator', 'bg-blue-600', 'shadow-blue-500/20'),
    QuickActionCard('pokedex', 'Pokédex', 'Stats & Moves', 'book-open', 'bg-green-600', 'shadow-green-500/20'),
    QuickActionCard('nickname', 'Nicknames', 'Get creative', 'sparkles', 'bg-purple-600', 'shadow-purple-500/20'),
    QuickActionCard('teams', 'Team Builder', 'Beat the gyms', 'users', 'bg-yellow-500', 'shadow-yellow-500/20'),
  ].join('');

  return `
    <div class="space-y-8">
      <!-- Hero Section -->
      <div class="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-red-500/20 text-white">
        <div class="relative z-10 max-w-lg">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Welcome, <span class="text-red-200">Trainer!</span>
          </h1>
          <p class="text-red-100 text-lg mb-8 leading-relaxed font-medium opacity-90">
            Your ultimate companion for competitive battling, team building, and mastering the type chart.
          </p>
          <a href="#pokedex"
             class="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-900 text-red-600 dark:text-white rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-lg hover:bg-red-50 dark:hover:bg-black"
             data-nav="pokedex">
            Explore Dex <i data-lucide="arrow-right" class="w-5 h-5"></i>
          </a>
        </div>

        <!-- Decorative background elements -->
        <div class="absolute right-[-50px] top-[-50px] opacity-10 rotate-12">
          <i data-lucide="circle" class="w-[400px] h-[400px]"></i>
        </div>
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
          class="absolute -right-4 -bottom-4 w-60 h-60 sm:w-80 sm:h-80 object-contain filter drop-shadow-2xl opacity-90"
          alt="Charizard"
        />
      </div>

      <!-- Quick Actions Grid -->
      <div>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <i data-lucide="activity" class="text-red-500"></i> Quick Actions
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${quickActions}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate the Calculator page content
 */
function renderCalculatorPage(): string {
  return `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Type Calculator</h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">Select up to two types to see defensive matchups.</p>
      </div>

      <!-- Type Selection Card - outer wrapper for dropdown positioning, inner card for overflow clipping -->
      <div class="relative mb-10">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="gradient-bar"></div>
          <div class="p-6 sm:p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Type 1 Dropdown -->
              <div id="type1-dropdown-container"></div>

              <!-- Type 2 Dropdown -->
              <div id="type2-dropdown-container"></div>
            </div>

            <button id="calculate-btn" class="btn-primary w-full mt-8">
              <i data-lucide="calculator" class="w-5 h-5"></i>
              Calculate Matchups
            </button>
          </div>
        </div>
      </div>

      <!-- Results Container -->
      <div id="results-container"></div>
    </div>
  `;
}

/**
 * Generate the Pokédex page content
 */
function renderPokedexPage(): string {
  return `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h1 class="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">Pokédex</h1>
          <p class="text-gray-500 dark:text-gray-400">Browse stats, types, and abilities.</p>
        </div>

        <div class="relative w-full sm:w-72">
          <input
            type="text"
            id="pokedex-search"
            placeholder="Search Pokémon..."
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none transition-all shadow-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          <i data-lucide="search" class="absolute left-3 top-3.5 text-gray-400 w-5 h-5"></i>
        </div>
      </div>

      <!-- Filter Row -->
      <div class="flex flex-wrap gap-4 mb-6">
        <select
          id="pokedex-type-filter"
          class="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
        >
          <option value="">All Types</option>
        </select>

        <select
          id="pokedex-sort"
          class="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
        >
          <option value="number">Pokédex #</option>
          <option value="name">Name (A-Z)</option>
          <option value="hp">HP (High-Low)</option>
          <option value="attack">Attack (High-Low)</option>
          <option value="defense">Defense (High-Low)</option>
          <option value="speed">Speed (High-Low)</option>
          <option value="total">Total Stats (High-Low)</option>
        </select>
      </div>

      <!-- Pokémon Grid -->
      <div id="pokemon-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Pokémon cards will be inserted here by pokedex.ts -->
      </div>

      <!-- Loading State -->
      <div id="pokedex-loading" class="card text-center py-12">
        <div class="spinner mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">Loading Pokédex...</p>
      </div>

      <!-- Empty State -->
      <div id="pokedex-empty" class="card text-center py-12 hidden">
        <i data-lucide="search-x" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400">No Pokémon found matching your search.</p>
      </div>
    </div>
  `;
}

/**
 * Generate the Team Builder page content
 */
function renderTeamsPage(): string {
  return `
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Campaign Team Builder</h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">Get optimal team suggestions for gym leaders using only available Pokémon.</p>
      </div>

      <div id="team-builder-content">
        <!-- Content will be injected by team-builder.ts -->
      </div>
    </div>
  `;
}

/**
 * Generate the Nickname Generator page content
 */
function renderNicknamePage(): string {
  return `
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Nickname Generator</h1>
        <p class="text-gray-500 dark:text-gray-400">Craft the perfect name for your partner.</p>
      </div>

      <div id="nickname-generator-content">
        <!-- Content will be injected by nickname-generator.ts -->
      </div>
    </div>
  `;
}

/**
 * Initialize the entire app
 */
function initApp(): void {
  // Initialize theme first (before rendering)
  initTheme();

  const app = document.querySelector<HTMLDivElement>('#app')!;

  // Render app shell
  app.innerHTML = `
    ${NavBar(currentPage)}

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <!-- Home Page -->
      <div id="page-home" class="page active">
        ${renderHomePage()}
      </div>

      <!-- Calculator Page -->
      <div id="page-calculator" class="page">
        ${renderCalculatorPage()}
      </div>

      <!-- Pokédex Page -->
      <div id="page-pokedex" class="page">
        ${renderPokedexPage()}
      </div>

      <!-- Team Builder Page -->
      <div id="page-teams" class="page">
        ${renderTeamsPage()}
      </div>

      <!-- Nickname Generator Page -->
      <div id="page-nickname" class="page">
        ${renderNicknamePage()}
      </div>
    </main>
  `;

  // Initialize Lucide icons
  lucide.createIcons();

  // Attach event listeners

  // Navigation links (both desktop and mobile)
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-nav') as PageId;
      if (pageId) navigateTo(pageId);
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
      lucide.createIcons(); // Re-render icons for theme change
    });
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Hash change handler for browser back/forward
  window.addEventListener('hashchange', () => {
    const page = getPageFromHash();
    navigateTo(page, false);
  });

  // Initialize page modules
  initCalculator();
  initPokedex();

  // Navigate to initial page from URL hash
  const initialPage = getPageFromHash();
  if (initialPage !== 'home') {
    navigateTo(initialPage, false);
  }
}

// Start the app
initApp();
