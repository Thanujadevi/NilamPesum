/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f2',
          100: '#ddeee1',
          200: '#bdddc5',
          300: '#91c3a1',
          400: '#63a37b',
          500: '#3e8459',
          600: '#2f6a46',
          700: '#265438',
          800: '#193926',
          900: '#0e2418',
          950: '#06130b',
        },
        leaf: {
          50: '#f4fbf0',
          100: '#e5f6dd',
          200: '#ccedbe',
          300: '#a6de93',
          400: '#7bc863',
          500: '#58ac3e',
          600: '#438a2e',
          700: '#356d26',
          800: '#2c5622',
          900: '#25481e',
        },
        cream: {
          50: '#fcfbfa',
          100: '#f7f5f0',
          200: '#eee9df',
          300: '#ded4c3',
          400: '#c8b8a0',
          500: '#b49e83',
          600: '#a38a70',
          700: '#87705c',
        },
        earth: {
          50: '#faf6f2',
          100: '#f3ece3',
          200: '#e6d8c4',
          300: '#d5bea1',
          400: '#c19f7b',
          500: '#b1845c',
          600: '#9e6d4c',
          700: '#7d523c',
          800: '#674435',
          900: '#54392e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Mukta Malar', 'sans-serif']
      }
    },
  },
  plugins: [],
}

