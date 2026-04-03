import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lumis: {
          bg:       '#030309',
          surface:  '#0d0d1a',
          card:     '#111121',
          border:   'rgba(255,255,255,0.07)',
          violet:   '#8b5cf6',
          'violet-bright': '#a78bfa',
          cyan:     '#06b6d4',
          'cyan-bright': '#22d3ee',
          gold:     '#f59e0b',
          'gold-bright': '#fbbf24',
          text:     '#f1f5f9',
          muted:    '#94a3b8',
          dim:      '#475569',
        },
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'lumis-hero':        'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(6,182,212,0.15) 0%, transparent 50%), #030309',
        'lumis-card':        'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'violet-glow':       'radial-gradient(circle at center, rgba(139,92,246,0.3) 0%, transparent 70%)',
        'cyan-glow':         'radial-gradient(circle at center, rgba(6,182,212,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-violet': '0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.15)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.15)',
        'glow-gold':   '0 0 20px rgba(245,158,11,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
        'card-hover':  '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.3)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.6s ease-out',
        'fade-in':      'fadeIn 0.5s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
        'spin-slow':    'spin 8s linear infinite',
        'border-flow':  'borderFlow 3s linear infinite',
        'scan':         'scan 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(139,92,246,0.4)' },
          '50%':      { opacity: '0.7', boxShadow: '0 0 40px rgba(139,92,246,0.8)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%':      { transform: 'translateY(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
