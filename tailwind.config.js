/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        oracle: {
          base:       '#080C14',
          navy:       '#0D1421',
          card:       '#111827',
          border:     '#1E293B',
          teal:       '#00E5CC',
          'teal-dim': '#00B5A0',
          amber:      '#F59E0B',
          crimson:    '#EF4444',
          muted:      '#64748B',
          text:       '#CBD5E1',
          bright:     '#F1F5F9',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"DM Mono"', 'monospace'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'oracle-gradient': 'radial-gradient(ellipse at top, #0D1F3C 0%, #080C14 60%)',
        'teal-glow':       'radial-gradient(circle, rgba(0,229,204,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'oracle-card': '0 0 0 1px rgba(0,229,204,0.08), 0 4px 24px rgba(0,0,0,0.4)',
        'teal-glow':   '0 0 30px rgba(0,229,204,0.2)',
        'oracle-lg':   '0 0 0 1px rgba(30,41,59,1), 0 20px 60px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'glow':       'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,229,204,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,229,204,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
