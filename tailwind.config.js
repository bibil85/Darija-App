/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './constants.ts',
    './data/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        kids: ['"Fredoka"', '"Fredoka One"', 'cursive', 'sans-serif'],
        body: ['"Nunito"', '"Quicksand"', 'sans-serif'],
        arabic: ['"Noto Sans Arabic"', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#FFFDF7',
          100: '#FFF7E6',
          200: '#FDECC8',
          300: '#F8D89C',
        },
        terracotta: {
          400: '#F07D57',
          500: '#E5633B',
          600: '#C94B25',
        },
        majorelle: {
          400: '#3B82F6',
          500: '#1D5FD1',
          600: '#1547A3',
        },
        minttile: {
          400: '#2DD4BF',
          500: '#14A392',
          600: '#0E7F72',
        },
        saffron: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
    },
  },
  plugins: [],
};
