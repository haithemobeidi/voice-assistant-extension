// typeConfig.ts
// Centralized type configuration for the redesigned UI
// Maps Pokémon types to colors and Lucide icon names
// Used by TypeBadge, TypeDropdown, and Pokédex cards

import type { PokemonType } from '../types/pokemon';

/**
 * Type configuration interface
 * Each type has a color (hex), lucide icon name, and display label
 */
export interface TypeConfig {
  color: string;
  icon: string;  // Lucide icon name (kebab-case)
  label: string;
}

/**
 * Complete type configuration mapping
 * Colors match official Pokémon type colors from design guidelines
 * Icons are semantic Lucide icons that represent each type's theme
 */
export const TYPE_CONFIG: Record<Lowercase<PokemonType>, TypeConfig> = {
  normal: { color: '#A8A77A', icon: 'circle', label: 'Normal' },
  fire: { color: '#EE8130', icon: 'flame', label: 'Fire' },
  water: { color: '#6390F0', icon: 'droplet', label: 'Water' },
  electric: { color: '#F7D02C', icon: 'zap', label: 'Electric' },
  grass: { color: '#7AC74C', icon: 'leaf', label: 'Grass' },
  ice: { color: '#96D9D6', icon: 'snowflake', label: 'Ice' },
  fighting: { color: '#C22E28', icon: 'swords', label: 'Fighting' },
  poison: { color: '#A33EA1', icon: 'skull', label: 'Poison' },
  ground: { color: '#E2BF65', icon: 'mountain', label: 'Ground' },
  flying: { color: '#A98FF3', icon: 'wind', label: 'Flying' },
  psychic: { color: '#F95587', icon: 'eye', label: 'Psychic' },
  bug: { color: '#A6B91A', icon: 'bug', label: 'Bug' },
  rock: { color: '#B6A136', icon: 'hexagon', label: 'Rock' },
  ghost: { color: '#735797', icon: 'ghost', label: 'Ghost' },
  dragon: { color: '#6F35FC', icon: 'crown', label: 'Dragon' },
  dark: { color: '#705746', icon: 'moon', label: 'Dark' },
  steel: { color: '#B7B7CE', icon: 'shield', label: 'Steel' },
  fairy: { color: '#D685AD', icon: 'star', label: 'Fairy' },
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
