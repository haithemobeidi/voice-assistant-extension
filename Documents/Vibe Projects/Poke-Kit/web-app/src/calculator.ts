// calculator.ts
// Type Calculator UI logic with button-based type selectors
// Features: Type buttons with watermark SVG icons, scoreboard results, matchup breakdown

import { getFullDefensiveProfile } from './data/typeChart';
import { findTypeCombo, getTierDescription } from './data/typeCombos';
import { getTypeConfig, TYPE_CONFIG } from './shared/typeConfig';
import { TypeBadge } from './shared/components';
import type { PokemonType, DefensiveProfile } from './types/pokemon';

// Declare lucide global (loaded via CDN)
declare const lucide: {
  createIcons: () => void;
};

// State for selected types
let selectedType1: PokemonType | null = null;
let selectedType2: PokemonType | null = null;

/**
 * Initialize the Type Calculator page
 * Creates dropdown selectors and attaches event handlers
 */
export function initCalculator(): void {
  const type1Container = document.getElementById('type1-dropdown-container');
  const type2Container = document.getElementById('type2-dropdown-container');
  const calculateBtn = document.getElementById('calculate-btn') as HTMLButtonElement | null;

  if (!type1Container || !type2Container || !calculateBtn) {
    return;
  }

  // Render initial dropdowns
  renderTypeDropdown(type1Container, 'type1', 'Type 1 (Primary)', selectedType1);
  renderTypeDropdown(type2Container, 'type2', 'Type 2 (Secondary)', selectedType2);

  // Calculate button handler
  calculateBtn.addEventListener('click', () => {
    if (!selectedType1) {
      alert('Please select Type 1 (required)');
      return;
    }

    const profile = getFullDefensiveProfile(selectedType1, selectedType2);
    displayResults(selectedType1, selectedType2, profile);
  });

  // Initialize Lucide icons
  lucide.createIcons();
}

/**
 * Render a type dropdown component
 * Uses watermark-style SVG icons - HUGE centered icon for selected, smaller for dropdown options
 */
function renderTypeDropdown(
  container: HTMLElement,
  dropdownId: string,
  label: string,
  selectedType: PokemonType | null
): void {
  const config = selectedType ? getTypeConfig(selectedType) : null;

  // Build trigger button style
  const buttonStyle = config
    ? `background-color: ${config.color};`
    : '';

  const buttonClasses = config
    ? 'border-transparent text-white shadow-lg shadow-black/10'
    : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500';

  const labelText = config ? config.label : 'Select Type';

  // HUGE centered watermark icon for selected state
  const selectedIcon = config
    ? `<img src="${config.icon}" alt="" class="absolute top-1/2 left-1/2 -translate-y-1/2 opacity-20 pointer-events-none" style="height: 350%;">`
    : '';

  // Generate dropdown options - type buttons with watermark icons (120% height, right: -7%)
  const typeOptions = Object.entries(TYPE_CONFIG).map(([_key, typeConfig]) => `
    <button
      class="type-option relative flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm text-white uppercase overflow-hidden transition-all hover:scale-105 hover:shadow-lg"
      style="background-color: ${typeConfig.color}; text-shadow: 0 1px 2px rgba(0,0,0,0.3);"
      data-type="${typeConfig.label}"
      data-dropdown="${dropdownId}"
    >
      <img
        src="${typeConfig.icon}"
        alt=""
        class="absolute top-1/2 -translate-y-1/2 opacity-25 pointer-events-none"
        style="height: 120%; right: -7%;"
      />
      <span class="relative z-10">${typeConfig.label}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="relative w-full" data-dropdown-container="${dropdownId}">
      <label class="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500 dark:text-gray-400">
        ${label}
      </label>
      <button
        class="type-dropdown-trigger relative w-full flex items-center justify-center px-4 py-4 rounded-xl transition-all duration-200 overflow-hidden ${buttonClasses}"
        style="${buttonStyle}"
        data-dropdown-trigger="${dropdownId}"
        aria-expanded="false"
      >
        ${selectedIcon}
        <span class="font-bold text-lg relative z-10">${labelText}</span>
      </button>

      <div
        class="type-dropdown-menu hidden fixed z-[100] rounded-2xl shadow-2xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-3 max-h-[400px] overflow-y-auto"
        data-dropdown-menu="${dropdownId}"
      >
        <!-- None option -->
        <button
          class="type-option w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600"
          data-type=""
          data-dropdown="${dropdownId}"
        >
          None
        </button>

        <div class="grid grid-cols-3 gap-2">
          ${typeOptions}
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  const trigger = container.querySelector(`[data-dropdown-trigger="${dropdownId}"]`);
  const menu = container.querySelector(`[data-dropdown-menu="${dropdownId}"]`);

  if (trigger && menu) {
    // Toggle dropdown on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menu.classList.contains('hidden');

      // Close all other dropdowns first
      document.querySelectorAll('.type-dropdown-menu').forEach(m => {
        m.classList.add('hidden');
      });
      document.querySelectorAll('.type-dropdown-trigger').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        menu.classList.remove('hidden');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Handle type option selection
    container.querySelectorAll('.type-option').forEach(option => {
      option.addEventListener('click', () => {
        const typeName = option.getAttribute('data-type');
        const dropdownIdAttr = option.getAttribute('data-dropdown');

        if (dropdownIdAttr === 'type1') {
          selectedType1 = typeName ? (typeName as PokemonType) : null;
          renderTypeDropdown(
            document.getElementById('type1-dropdown-container')!,
            'type1',
            'Type 1 (Primary)',
            selectedType1
          );
        } else {
          selectedType2 = typeName ? (typeName as PokemonType) : null;
          renderTypeDropdown(
            document.getElementById('type2-dropdown-container')!,
            'type2',
            'Type 2 (Secondary)',
            selectedType2
          );
        }

        lucide.createIcons();
      });
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(`[data-dropdown-container="${dropdownId}"]`)) {
      menu?.classList.add('hidden');
      trigger?.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Display calculation results with scoreboard and matchup breakdown
 * Matches the redesigned UI with colored scoreboard cards
 */
function displayResults(
  type1: PokemonType,
  type2: PokemonType | null,
  profile: DefensiveProfile
): void {
  const resultsContainer = document.getElementById('results-container');
  if (!resultsContainer) return;

  // Get type combo ranking (if dual-type)
  const comboRanking = type2 ? findTypeCombo(type1, type2) : null;

  // Categorize matchups by effectiveness
  const quad = profile.matchups.filter(m => m.mult === 4);     // 4x weakness
  const double = profile.matchups.filter(m => m.mult === 2);    // 2x weakness
  const half = profile.matchups.filter(m => m.mult === 0.5);    // 0.5x resistance
  const quarter = profile.matchups.filter(m => m.mult === 0.25);// 0.25x resistance
  const immune = profile.matchups.filter(m => m.mult === 0);    // Immunity

  const totalWeaknesses = quad.length + double.length;
  const totalResistances = half.length + quarter.length;
  const totalImmunities = immune.length;

  resultsContainer.innerHTML = `
    <!-- Scoreboard -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Weaknesses -->
      <div class="scoreboard-card bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
        <div class="icon-wrapper bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
          <i data-lucide="trending-up" class="w-8 h-8"></i>
        </div>
        <span class="value text-gray-900 dark:text-white">${totalWeaknesses}x</span>
        <span class="label text-red-500">Weaknesses</span>
      </div>

      <!-- Resistances -->
      <div class="scoreboard-card bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
        <div class="icon-wrapper bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
          <i data-lucide="shield" class="w-8 h-8"></i>
        </div>
        <span class="value text-gray-900 dark:text-white">${totalResistances}x</span>
        <span class="label text-green-500">Resistances</span>
      </div>

      <!-- Immunities -->
      <div class="scoreboard-card bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div class="icon-wrapper bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          <i data-lucide="ghost" class="w-8 h-8"></i>
        </div>
        <span class="value text-gray-900 dark:text-white">${totalImmunities}x</span>
        <span class="label text-gray-500 dark:text-gray-400">Immunities</span>
      </div>
    </div>

    <!-- Matchup Breakdown Card -->
    <div class="card">
      <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Matchup Breakdown</h3>

      <div class="space-y-6">
        ${quad.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-red-500"></div>
              <span class="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Major Weaknesses (4x)</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${quad.map(m => TypeBadge(m.attacker, 'lg')).join('')}
            </div>
          </div>
          <div class="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
        ` : ''}

        ${double.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-orange-400"></div>
              <span class="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Weaknesses (2x)</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${double.map(m => TypeBadge(m.attacker, 'lg')).join('')}
            </div>
          </div>
          <div class="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
        ` : ''}

        ${half.length > 0 || quarter.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <span class="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Resistances (0.5x${quarter.length > 0 ? ' / 0.25x' : ''})</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${[...half, ...quarter].map(m => TypeBadge(m.attacker, 'lg')).join('')}
            </div>
          </div>
        ` : ''}

        ${immune.length > 0 ? `
          <div class="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
          <div class="space-y-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-purple-500"></div>
              <span class="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Immunities (0x)</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${immune.map(m => TypeBadge(m.attacker, 'lg')).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      ${comboRanking ? `
        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Type Ranking:</span>
            <span class="px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
              Tier ${comboRanking.tier} • Rank #${comboRanking.rank}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">${getTierDescription(comboRanking.tier)}</p>
        </div>
      ` : ''}
    </div>
  `;

  // Re-render Lucide icons in results
  lucide.createIcons();

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
