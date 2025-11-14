// calculator.ts
// Type Calculator UI logic and event handlers

import { TYPE_NAMES, getFullDefensiveProfile } from './data/typeChart';
import { findTypeCombo, getTierDescription } from './data/typeCombos';
import type { PokemonType, DefensiveProfile } from './types/pokemon';

/**
 * Initialize the Type Calculator page
 * Populates dropdowns and attaches event handlers
 */
export function initCalculator(): void {
  const type1Select = document.getElementById('type1') as HTMLSelectElement | null;
  const type2Select = document.getElementById('type2') as HTMLSelectElement | null;
  const calculateBtn = document.getElementById('calculate-btn') as HTMLButtonElement | null;

  if (!type1Select || !type2Select || !calculateBtn) {
    console.error('Calculator elements not found in DOM');
    return;
  }

  // Populate type dropdowns
  TYPE_NAMES.forEach(typeName => {
    const option1 = document.createElement('option');
    option1.value = typeName;
    option1.textContent = typeName;
    type1Select.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = typeName;
    option2.textContent = typeName;
    type2Select.appendChild(option2);
  });

  // Calculate button handler
  calculateBtn.addEventListener('click', () => {
    const type1 = type1Select.value as PokemonType | '';
    const type2 = type2Select.value as PokemonType | '';

    if (!type1) {
      alert('Please select at least Type 1');
      return;
    }

    // Calculate defensive profile
    const profile = getFullDefensiveProfile(type1, type2 || null);
    displayResults(type1, type2 || null, profile);
  });

  // Allow Enter key to trigger calculation
  type1Select.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculateBtn.click();
  });
  type2Select.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculateBtn.click();
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
