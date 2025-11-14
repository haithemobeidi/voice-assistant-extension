/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poke: {
          red: '#EF5350',
          blue: '#2A75BB',
          yellow: '#FFCB05',
          dark: '#333333',
          'light-gray': '#F5F5F5',
          gray: '#E0E0E0',
        },
        type: {
          normal: '#A8A878',
          fire: '#F08030',
          water: '#6890F0',
          grass: '#78C850',
          electric: '#F8D030',
          ice: '#98D8D8',
          fighting: '#C03028',
          poison: '#A040A0',
          ground: '#E0C068',
          flying: '#A890F0',
          psychic: '#F85888',
          bug: '#A8B820',
          rock: '#B8A038',
          ghost: '#705898',
          dragon: '#7038F8',
          dark: '#705848',
          steel: '#B8B8D0',
          fairy: '#EE99AC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',
        'button': '0.75rem',
        'app': '1.5rem',
      }
    },
  },
  plugins: [],
}
