/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    // Type color classes - prevent purging since they're dynamically generated
    'type-normal', 'type-fire', 'type-water', 'type-grass',
    'type-electric', 'type-ice', 'type-fighting', 'type-poison',
    'type-ground', 'type-flying', 'type-psychic', 'type-bug',
    'type-rock', 'type-ghost', 'type-dragon', 'type-dark',
    'type-steel', 'type-fairy',
    // Type background colors for Pokédex cards
    'bg-type-normal', 'bg-type-fire', 'bg-type-water', 'bg-type-grass',
    'bg-type-electric', 'bg-type-ice', 'bg-type-fighting', 'bg-type-poison',
    'bg-type-ground', 'bg-type-flying', 'bg-type-psychic', 'bg-type-bug',
    'bg-type-rock', 'bg-type-ghost', 'bg-type-dragon', 'bg-type-dark',
    'bg-type-steel', 'bg-type-fairy'
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (new gamer aesthetic)
        brand: {
          red: '#EF4444',
          'red-dark': '#DC2626',
        },
        // Legacy poke colors (keep for backward compat during migration)
        poke: {
          red: '#EF5350',
          blue: '#2A75BB',
          yellow: '#FFCB05',
          dark: '#333333',
          'light-gray': '#F5F5F5',
          gray: '#E0E0E0',
        },
        // Official Pokémon type colors (updated to match design guidelines)
        type: {
          normal: '#A8A77A',
          fire: '#EE8130',
          water: '#6390F0',
          electric: '#F7D02C',
          grass: '#7AC74C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          steel: '#B7B7CE',
          dark: '#705746',
          fairy: '#D685AD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',
        'button': '0.75rem',
        'app': '1.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'gamer': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'gamer-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
