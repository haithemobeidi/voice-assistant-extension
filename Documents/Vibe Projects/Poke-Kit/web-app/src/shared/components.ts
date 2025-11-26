// components.ts
// Reusable UI component generators for the redesigned app
// These functions return HTML strings that can be inserted into the DOM

import { getTypeConfig } from './typeConfig';

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

