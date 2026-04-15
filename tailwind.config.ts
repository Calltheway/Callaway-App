import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        keeper: {
          base:    '#0A1628',
          surface: '#0F1E38',
          card:    '#132440',
          border:  '#1E3A5F',
          green:   '#00C48C',
          'green-dim': '#00A070',
          amber:   '#F59E0B',
          red:     '#EF4444',
          muted:   '#4E6A8A',
          text:    '#94B0C8',
          bright:  '#E2EEF9',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        'keeper-card': '0 0 0 1px rgba(0,196,140,0.06), 0 4px 24px rgba(0,0,0,0.5)',
        'keeper-glow': '0 0 30px rgba(0,196,140,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-up':    'fadeUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
