/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        navy: {
          50:  '#E8ECF5',
          100: '#C5CFDF',
          200: '#9FAFCD',
          300: '#7A8FBB',
          400: '#5F78AD',
          500: '#4461A0',
          600: '#3A5593',
          700: '#2E4783',
          800: '#223A73',
          900: '#0F1C3F',  // Primary Navy
          950: '#0A1229',
        },
        emerald: {
          50:  '#E0FAF3',
          100: '#B3F3E1',
          200: '#7FECCC',
          300: '#4BE5B8',
          400: '#26DEA9',
          500: '#00C48C',  // Primary Emerald / Accent
          600: '#00B57F',
          700: '#00A370',
          800: '#00915F',
          900: '#006F47',
        },
        // Semantic colors
        success: '#00C48C',
        warning: '#FFB020',
        error:   '#E53935',
        info:    '#2196F3',
        // Neutral grays
        surface: '#F8F9FC',
        border:  '#E4E8EF',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
