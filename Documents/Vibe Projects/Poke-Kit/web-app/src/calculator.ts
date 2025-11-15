// calculator.ts
// Type Calculator UI logic and event handlers with button-based type selectors

import { TYPE_NAMES, getFullDefensiveProfile } from './data/typeChart';
import { findTypeCombo, getTierDescription } from './data/typeCombos';
import type { PokemonType, DefensiveProfile } from './types/pokemon';

// State for selected types
let selectedType1: PokemonType | null = null;
let selectedType2: PokemonType | null = null;

/**
 * Initialize the Type Calculator page
 * Creates button grids for type selection and attaches event handlers
 */
export function initCalculator(): void {
  const type1Grid = document.getElementById('type1-grid');
  const type2Grid = document.getElementById('type2-grid');
  const clearType1Btn = document.getElementById('clear-type1');
  const clearType2Btn = document.getElementById('clear-type2');
  const calculateBtn = document.getElementById('calculate-btn') as HTMLButtonElement | null;

  if (!type1Grid || !type2Grid || !clearType1Btn || !clearType2Btn || !calculateBtn) {
    console.error('Calculator elements not found in DOM');
    return;
  }

  // Populate type button grids
  populateTypeGrid(type1Grid, 'type1');
  populateTypeGrid(type2Grid, 'type2');

  // Clear button handlers
  clearType1Btn.addEventListener('click', () => {
    selectedType1 = null;
    updateButtonStates('type1');
    clearType1Btn.style.display = 'none';
  });

  clearType2Btn.addEventListener('click', () => {
    selectedType2 = null;
    updateButtonStates('type2');
    clearType2Btn.style.display = 'none';
  });

  // Calculate button handler
  calculateBtn.addEventListener('click', () => {
    if (!selectedType1) {
      alert('Please select Type 1 (required)');
      return;
    }

    // Calculate defensive profile
    const profile = getFullDefensiveProfile(selectedType1, selectedType2);
    displayResults(selectedType1, selectedType2, profile);
  });
}

/**
 * Populate a type grid with clickable type buttons
 * Text is wrapped in a span for proper z-index layering with icon pseudo-elements
 */
function populateTypeGrid(gridElement: HTMLElement, gridType: 'type1' | 'type2'): void {
  TYPE_NAMES.forEach(typeName => {
    const button = document.createElement('button');
    button.className = `type-button type-pill type-${typeName.toLowerCase()}`;

    // Wrap text in span for z-index layering with icons
    const span = document.createElement('span');
    span.textContent = typeName;
    button.appendChild(span);

    button.dataset.type = typeName;
    button.dataset.grid = gridType;

    button.addEventListener('click', () => handleTypeSelection(typeName, gridType));

    gridElement.appendChild(button);
  });
}

/**
 * Handle type button click
 */
function handleTypeSelection(typeName: PokemonType, gridType: 'type1' | 'type2'): void {
  if (gridType === 'type1') {
    // If clicking the same type, deselect it
    if (selectedType1 === typeName) {
      selectedType1 = null;
      document.getElementById('clear-type1')!.style.display = 'none';
    } else {
      selectedType1 = typeName;
      document.getElementById('clear-type1')!.style.display = 'block';
    }
    updateButtonStates('type1');
  } else {
    // If clicking the same type, deselect it
    if (selectedType2 === typeName) {
      selectedType2 = null;
      document.getElementById('clear-type2')!.style.display = 'none';
    } else {
      selectedType2 = typeName;
      document.getElementById('clear-type2')!.style.display = 'block';
    }
    updateButtonStates('type2');
  }
}

/**
 * Update button selected states for a specific grid
 */
function updateButtonStates(gridType: 'type1' | 'type2'): void {
  const gridElement = document.getElementById(`${gridType}-grid`);
  if (!gridElement) return;

  const selectedType = gridType === 'type1' ? selectedType1 : selectedType2;
  const buttons = gridElement.querySelectorAll('.type-button');

  buttons.forEach(button => {
    const buttonType = button.getAttribute('data-type');
    if (buttonType === selectedType) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

/**
 * Display calculation results in the results container
 * Shows weaknesses, resistances, immunities, and tier ranking
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

  // Categorize matchups
  const weaknesses = profile.matchups.filter(m => m.mult > 1);
  const resistances = profile.matchups.filter(m => m.mult > 0 && m.mult < 1);
  const immunities = profile.matchups.filter(m => m.mult === 0);
  const neutral = profile.matchups.filter(m => m.mult === 1);

  // Build results HTML
  resultsContainer.innerHTML = `
    <!-- Selected Types Card -->
    <div class="card mt-6">
      <h3 class="text-lg font-semibold mb-3">Selected Types</h3>
      <div class="flex items-center gap-3 flex-wrap">
        <span class="type-pill type-${type1.toLowerCase()}">${type1}</span>
        ${type2 ? `<span class="type-pill type-${type2.toLowerCase()}">${type2}</span>` : ''}
        ${comboRanking ? `
          <span class="tier-pill tier-${comboRanking.tier.toLowerCase()} ml-4">
            Tier ${comboRanking.tier} - Rank #${comboRanking.rank}
          </span>
        ` : ''}
      </div>
      ${comboRanking ? `
        <p class="text-sm text-gray-600 mt-3">
          <strong>Tier Meaning:</strong> ${getTierDescription(comboRanking.tier)}
        </p>
      ` : ''}
    </div>

    <!-- Defensive Score Card -->
    <div class="card mt-4">
      <h3 class="text-lg font-semibold mb-3">Defensive Summary</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div class="text-3xl font-bold text-red-600">${profile.score.weak}</div>
          <div class="text-sm text-gray-600">Weaknesses</div>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="text-3xl font-bold text-blue-600">${profile.score.resist}</div>
          <div class="text-sm text-gray-600">Resistances</div>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="text-3xl font-bold text-purple-600">${profile.score.immune}</div>
          <div class="text-sm text-gray-600">Immunities</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div class="text-3xl font-bold ${profile.score.total >= 0 ? 'text-green-600' : 'text-red-600'}">${profile.score.total >= 0 ? '+' : ''}${profile.score.total}</div>
          <div class="text-sm text-gray-600">Total Score</div>
        </div>
      </div>
    </div>

    <!-- Detailed Matchups -->
    ${weaknesses.length > 0 ? `
      <div class="card mt-4">
        <h3 class="text-lg font-semibold mb-3 text-red-600">
          <i class="ph-fill ph-warning-circle mr-2"></i>Weaknesses (Takes More Damage)
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${weaknesses.map(m => `
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <span class="type-pill type-${m.attacker.toLowerCase()}">${m.attacker}</span>
              <span class="font-bold text-red-600">${m.mult}x</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${resistances.length > 0 ? `
      <div class="card mt-4">
        <h3 class="text-lg font-semibold mb-3 text-blue-600">
          <i class="ph-fill ph-shield-check mr-2"></i>Resistances (Takes Less Damage)
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${resistances.map(m => `
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span class="type-pill type-${m.attacker.toLowerCase()}">${m.attacker}</span>
              <span class="font-bold text-blue-600">${m.mult}x</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${immunities.length > 0 ? `
      <div class="card mt-4">
        <h3 class="text-lg font-semibold mb-3 text-purple-600">
          <i class="ph-fill ph-shield-star mr-2"></i>Immunities (No Effect)
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${immunities.map(m => `
            <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span class="type-pill type-${m.attacker.toLowerCase()}">${m.attacker}</span>
              <span class="font-bold text-purple-600">0x</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${neutral.length > 0 ? `
      <div class="card mt-4">
        <details>
          <summary class="text-md font-semibold cursor-pointer text-gray-700">
            <i class="ph-fill ph-equals mr-2"></i>Neutral Damage (${neutral.length} types)
          </summary>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
            ${neutral.map(m => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span class="type-pill type-${m.attacker.toLowerCase()}">${m.attacker}</span>
                <span class="font-bold text-gray-600">1x</span>
              </div>
            `).join('')}
          </div>
        </details>
      </div>
    ` : ''}
  `;

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
