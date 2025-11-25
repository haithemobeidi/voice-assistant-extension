// typeConfig.ts
// Centralized type configuration for the redesigned UI
// Maps Pokémon types to colors and official Pokémon type SVG icons
// Used by TypeBadge, TypeDropdown, and Pokédex cards

import type { PokemonType } from '../types/pokemon';

/**
 * Type configuration interface
 * Each type has a color (hex), SVG icon path, and display label
 */
export interface TypeConfig {
  color: string;
  icon: string;  // Path to official Pokémon type SVG icon
  label: string;
}

/**
 * Complete type configuration mapping
 * Colors match official Pokémon type colors from design guidelines
 * Icons are official Pokémon type SVGs from /type-icons/
 */
export const TYPE_CONFIG: Record<Lowercase<PokemonType>, TypeConfig> = {
  normal: { color: '#A8A77A', icon: '/type-icons/normal.svg', label: 'Normal' },
  fire: { color: '#EE8130', icon: '/type-icons/fire.svg', label: 'Fire' },
  water: { color: '#6390F0', icon: '/type-icons/water.svg', label: 'Water' },
  electric: { color: '#F7D02C', icon: '/type-icons/electric.svg', label: 'Electric' },
  grass: { color: '#7AC74C', icon: '/type-icons/grass.svg', label: 'Grass' },
  ice: { color: '#96D9D6', icon: '/type-icons/ice.svg', label: 'Ice' },
  fighting: { color: '#C22E28', icon: '/type-icons/fighting.svg', label: 'Fighting' },
  poison: { color: '#A33EA1', icon: '/type-icons/poison.svg', label: 'Poison' },
  ground: { color: '#E2BF65', icon: '/type-icons/ground.svg', label: 'Ground' },
  flying: { color: '#A98FF3', icon: '/type-icons/flying.svg', label: 'Flying' },
  psychic: { color: '#F95587', icon: '/type-icons/psychic.svg', label: 'Psychic' },
  bug: { color: '#A6B91A', icon: '/type-icons/bug.svg', label: 'Bug' },
  rock: { color: '#B6A136', icon: '/type-icons/rock.svg', label: 'Rock' },
  ghost: { color: '#735797', icon: '/type-icons/ghost.svg', label: 'Ghost' },
  dragon: { color: '#6F35FC', icon: '/type-icons/dragon.svg', label: 'Dragon' },
  dark: { color: '#705746', icon: '/type-icons/dark.svg', label: 'Dark' },
  steel: { color: '#B7B7CE', icon: '/type-icons/steel.svg', label: 'Steel' },
  fairy: { color: '#D685AD', icon: '/type-icons/fairy.svg', label: 'Fairy' },
};

/**
 * Get type configuration by type name (case-insensitive)
 * Returns Normal config as fallback for invalid types
 */
export function getTypeConfig(typeName: string): TypeConfig {
  const key = typeName.toLowerCase() as Lowercase<PokemonType>;
  return TYPE_CONFIG[key] || TYPE_CONFIG.normal;
}

/**
 * Get all type keys in order
 */
export const TYPE_KEYS = Object.keys(TYPE_CONFIG) as Lowercase<PokemonType>[];
