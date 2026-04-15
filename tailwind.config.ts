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
          void:    '#04080F',
          deep:    '#070D1A',
          base:    '#0A1220',
          surface: '#0D1829',
          card:    '#111F35',
          border:  '#1A3050',
          green:   '#00E87A',
          'green-dim': '#00B85F',
          'green-glow': 'rgba(0,232,122,0.15)',
          blue:    '#0088FF',
          purple:  '#7C3AED',
          red:     '#FF4560',
          amber:   '#FFAB00',
          muted:   '#3A5875',
          text:    '#7DA8CC',
          bright:  '#D4E8FF',
          white:   '#EEF6FF',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green':  '0 0 20px rgba(0,232,122,0.25), 0 0 60px rgba(0,232,122,0.08)',
        'glow-blue':   '0 0 20px rgba(0,136,255,0.25), 0 0 60px rgba(0,136,255,0.08)',
        'glow-sm':     '0 0 12px rgba(0,232,122,0.15)',
        'card-3d':     '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,232,122,0.06)',
        'glass':       'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,136,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,255,0.03) 1px, transparent 1px)',
        'green-radial':  'radial-gradient(circle, rgba(0,232,122,0.12) 0%, transparent 70%)',
        'blue-radial':   'radial-gradient(circle, rgba(0,136,255,0.10) 0%, transparent 70%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,136,255,0.15) 0%, transparent 60%)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'scan':       'scan 4s linear infinite',
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'shimmer':    'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
