// theme.ts
// Dark mode management for the app
// Persists theme preference to localStorage and respects system preference

import { STORAGE_KEYS } from './config';

type Theme = 'light' | 'dark';

/**
 * Get the current theme from localStorage or system preference
 */
export function getInitialTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Save theme preference to localStorage
 */
export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Toggle between light and dark themes
 * Returns the new theme
 */
export function toggleTheme(): Theme {
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme: Theme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  saveTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load
 * Call this early in app initialization
 */
export function initTheme(): Theme {
  const theme = getInitialTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Check if dark mode is currently active
 */
export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}
