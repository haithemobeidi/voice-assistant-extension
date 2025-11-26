// components.ts
// Reusable UI component generators for the redesigned app
// These functions return HTML strings that can be inserted into the DOM

import { getTypeConfig, TYPE_CONFIG } from './typeConfig';
import type { PokemonType } from '../types/pokemon';

/**
 * Generate a TypeBadge component (pill-shaped type indicator)
 * Uses centered official Pokémon type SVG icons as watermark (150% height, opacity-20)
 * Used in Pokédex cards, calculator results, nickname generator
 *
 * @param typeName - The Pokémon type name
 * @param size - 'sm' | 'md' | 'lg' (default: 'md')
 * @returns HTML string for the type badge
 */
export function TypeBadge(typeName: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const config = getTypeConfig(typeName);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return `
    <span
      class="type-badge relative inline-flex items-center justify-center font-bold text-white rounded-full shadow-sm uppercase tracking-wider overflow-hidden ${sizeClasses[size]}"
      style="background-color: ${config.color};"
    >
      <img
        src="${config.icon}"
        alt=""
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
        style="height: 150%;"
      />
      <span class="relative z-10">${config.label}</span>
    </span>
  `;
}

/**
 * Generate a simple TypeBadge without watermark icon (for compact displays)
 * Used in Pokédex card fronts and other space-constrained areas
 *
 * @param typeName - The Pokémon type name
 * @returns HTML string for the simple type badge
 */
export function TypeBadgeSimple(typeName: string): string {
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
 * Generate a tiny TypeBadge for very compact displays
 * Used in Pokédex card backs and form cycling
 *
 * @param typeName - The Pokémon type name
 * @returns HTML string for the tiny type badge
 */
export function TypeBadgeTiny(typeName: string): string {
  const config = getTypeConfig(typeName);
  return `
    <span
      class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
      style="background-color: ${config.color};"
    >
      ${config.label}
    </span>
  `;
}

/**
 * Generate the navigation bar HTML
 * Includes logo, desktop nav links, and theme toggle
 *
 * @param currentPage - The currently active page ID
 * @returns HTML string for the navigation bar
 */
export function NavBar(currentPage: string): string {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'calculator', label: 'Calculator', icon: 'calculator' },
    { id: 'pokedex', label: 'Pokédex', icon: 'book-open' },
    { id: 'nickname', label: 'Nicknames', icon: 'sparkles' },
  ];

  const navLinks = navItems.map(item => {
    const isActive = currentPage === item.id;
    const activeClass = isActive
      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';

    return `
      <a href="#${item.id}"
         class="px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeClass}"
         data-nav="${item.id}">
        <i data-lucide="${item.icon}" class="w-4 h-4"></i> ${item.label}
      </a>
    `;
  }).join('');

  return `
    <nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo -->
        <a href="#home" class="flex items-center gap-3 group" data-nav="home">
          <img src="/pokeball.svg" alt="Pokeball" class="w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-lg" />
          <span class="text-xl font-black tracking-tight group-hover:text-red-500 transition-colors dark:text-white">
            Poke<span class="text-red-500">ToolKit</span>
          </span>
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-2">
          ${navLinks}
        </div>

        <!-- Theme Toggle + Mobile Menu -->
        <div class="flex items-center gap-2">
          <button
            id="theme-toggle"
            class="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            <i data-lucide="moon" class="w-5 h-5 dark:hidden"></i>
            <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
          </button>

          <!-- Mobile Menu Toggle -->
          <button
            id="mobile-menu-toggle"
            class="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <i data-lucide="menu" class="w-6 h-6" id="menu-icon-open"></i>
            <i data-lucide="x" class="w-6 h-6 hidden" id="menu-icon-close"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Drawer -->
      <div id="mobile-menu" class="md:hidden hidden fixed inset-0 z-40 top-[65px] bg-white dark:bg-gray-900 transition-colors">
        <div class="p-4 space-y-2">
          ${navItems.map(item => {
            const isActive = currentPage === item.id;
            const activeClass = isActive
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-500 dark:text-gray-400';
            return `
              <a href="#${item.id}"
                 class="w-full p-4 rounded-xl font-bold text-lg flex items-center gap-4 transition-all ${activeClass}"
                 data-nav="${item.id}" data-mobile-nav>
                <i data-lucide="${item.icon}" class="w-6 h-6"></i>
                ${item.label}
              </a>
            `;
          }).join('')}
        </div>
      </div>
    </nav>
  `;
}

/**
 * Generate a Quick Action card for the home page bento grid
 *
 * @param id - Page ID to navigate to
 * @param name - Display name
 * @param desc - Short description
 * @param icon - Lucide icon name
 * @param bgColor - Tailwind background color class
 * @param shadowColor - Tailwind shadow color class
 * @returns HTML string for the quick action card
 */
export function QuickActionCard(
  id: string,
  name: string,
  desc: string,
  icon: string,
  bgColor: string,
  shadowColor: string
): string {
  return `
    <a href="#${id}"
       class="group relative h-40 ${bgColor} rounded-2xl p-6 text-white overflow-hidden shadow-lg ${shadowColor} hover:shadow-xl hover:-translate-y-1 transition-all"
       data-nav="${id}">
      <div class="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-transform group-hover:scale-110 duration-500">
        <i data-lucide="${icon}" class="w-20 h-20"></i>
      </div>
      <div class="relative h-full flex flex-col justify-end">
        <span class="bg-white/20 w-fit p-2 rounded-lg mb-2">
          <i data-lucide="${icon}" class="w-6 h-6"></i>
        </span>
        <h3 class="text-xl font-bold">${name}</h3>
        <p class="text-white/80 text-sm">${desc}</p>
      </div>
    </a>
  `;
}

/**
 * Generate the Type Dropdown component for the calculator
 * Transforms to show selected type color when active
 *
 * @param label - Label text above the dropdown
 * @param dropdownId - Unique ID for the dropdown
 * @param selectedType - Currently selected type (or null)
 * @returns HTML string for the type dropdown
 */
export function TypeDropdown(
  label: string,
  dropdownId: string,
  selectedType: PokemonType | null
): string {
  const config = selectedType ? getTypeConfig(selectedType) : null;

  const buttonStyle = config
    ? `background-color: ${config.color};`
    : '';

  const buttonClasses = config
    ? 'border-transparent text-white shadow-lg shadow-black/10'
    : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500';

  const iconContent = config
    ? `<i data-lucide="${config.icon}" class="w-5 h-5"></i>`
    : '<div class="w-5 h-5 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500"></div>';

  const labelText = config ? config.label : 'Select Type';

  // Generate dropdown options
  const typeOptions = Object.entries(TYPE_CONFIG).map(([_key, typeConfig]) => `
    <button
      class="type-option flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 w-full text-left"
      data-type="${typeConfig.label}"
      data-dropdown="${dropdownId}"
    >
      <div
        class="w-6 h-6 rounded-full flex items-center justify-center text-white"
        style="background-color: ${typeConfig.color};"
      >
        <i data-lucide="${typeConfig.icon}" class="w-3 h-3"></i>
      </div>
      <span class="font-bold text-sm">${typeConfig.label}</span>
    </button>
  `).join('');

  return `
    <div class="relative w-full" data-dropdown-container="${dropdownId}">
      <label class="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500 dark:text-gray-400">
        ${label}
      </label>
      <button
        class="type-dropdown-trigger w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 ${buttonClasses}"
        style="${buttonStyle}"
        data-dropdown-trigger="${dropdownId}"
      >
        <div class="flex items-center gap-3">
          ${iconContent}
          <span class="font-bold text-lg">${labelText}</span>
        </div>
        <i data-lucide="chevron-down" class="w-5 h-5 transition-transform duration-200"></i>
      </button>

      <div
        class="type-dropdown-menu hidden absolute z-50 mt-2 w-full rounded-2xl shadow-xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-2 max-h-80 overflow-y-auto"
        data-dropdown-menu="${dropdownId}"
      >
        <!-- None option -->
        <button
          class="type-option flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 w-full text-left"
          data-type=""
          data-dropdown="${dropdownId}"
        >
          <div class="w-6 h-6 rounded-full border border-gray-400 dark:border-gray-500"></div>
          <span class="font-medium">None</span>
        </button>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2">
          ${typeOptions}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate a Pokédex card with floating sprite and type background
 * Uses HD official artwork from PokeAPI
 *
 * @param pokemon - Pokemon data object
 * @returns HTML string for the Pokédex card
 */
export function PokedexCard(pokemon: {
  id: number;
  name: string;
  types: string[];
  bst: number;
  spriteUrl?: string;
}): string {
  const mainType = pokemon.types[0]?.toLowerCase() || 'normal';
  const config = getTypeConfig(mainType);

  // Use official artwork URL
  const spriteUrl = pokemon.spriteUrl ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const typeBadges = pokemon.types.map(t => TypeBadge(t, 'sm')).join('');
  const formattedId = String(pokemon.id).padStart(4, '0');

  return `
    <div
      class="group relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-visible mt-8 cursor-pointer"
      data-pokemon-id="${pokemon.id}"
    >
      <!-- Background type splash -->
      <div
        class="absolute inset-0 rounded-3xl opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"
        style="background-color: ${config.color};"
      ></div>

      <!-- Floating sprite -->
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
        <img
          src="${spriteUrl}"
          alt="${pokemon.name}"
          class="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div class="pt-20 text-center relative z-0">
        <span class="block text-gray-400 font-bold text-xs tracking-widest mb-1">
          #${formattedId}
        </span>
        <h3 class="text-xl font-black mb-3 text-gray-900 dark:text-white capitalize">
          ${pokemon.name}
        </h3>

        <div class="flex justify-center gap-2 mb-4 flex-wrap">
          ${typeBadges}
        </div>

        <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 flex justify-between items-center border border-gray-100 dark:border-gray-700">
          <span class="text-xs font-bold text-gray-400 uppercase">Total Stats</span>
          <span class="text-lg font-black" style="color: ${config.color};">${pokemon.bst}</span>
        </div>
      </div>
    </div>
  `;
}
