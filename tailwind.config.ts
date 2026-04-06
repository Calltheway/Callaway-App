import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dopamind: {
          navy:   '#0A0E1A',
          teal:   '#00D4FF',
          gold:   '#FFD700',
          dark:   '#060912',
          card:   '#111827',
          border: '#1E2A3A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF' },
          to:   { boxShadow: '0 0 20px #00D4FF, 0 0 40px #00D4FF, 0 0 60px #00D4FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
