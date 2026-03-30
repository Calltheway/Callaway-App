import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#E8ECF5',
          100: '#C5CFDF',
          500: '#2E4783',
          700: '#152450',
          900: '#0F1C3F',
          950: '#0A1229',
        },
        emerald: {
          400: '#33D0A4',
          500: '#00C48C',
          600: '#00A370',
          700: '#006F47',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
