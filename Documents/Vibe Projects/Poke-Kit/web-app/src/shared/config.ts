/**
 * Centralized configuration constants for Poke-Kit
 * All magic numbers and storage keys should be defined here for maintainability
 */

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  /** Theme preference (light/dark) */
  THEME: 'poketoolkit-theme',
  /** Saved nickname favorites */
  NICKNAME_FAVORITES: 'nickname-favorites',
  /** Gemini API key for nickname generation */
  GEMINI_API_KEY: 'gemini-api-key',
} as const;

// =============================================================================
// POKEDEX CONFIGURATION
// =============================================================================

export const POKEDEX_CONFIG = {
  /** Initial number of Pokemon groups to display */
  INITIAL_DISPLAY_LIMIT: 20,
  /** Number of additional groups to load on scroll */
  LOAD_INCREMENT: 20,
  /** Maximum stat value for scaling stat bars (base stat ceiling) */
  MAX_STAT_VALUE: 150,
} as const;

// =============================================================================
// NICKNAME GENERATOR CONFIGURATION
// =============================================================================

export const NICKNAME_CONFIG = {
  /** Maximum number of styles that can be selected at once */
  MAX_STYLES: 2,
  /** Gemini model fallback chain (try in order if previous fails) */
  GEMINI_MODELS: ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'] as const,
} as const;
