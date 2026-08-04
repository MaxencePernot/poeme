/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── Palette : blanc + violet pastel + vert pastel ──────────────
      // L'encre n'est pas noire mais une aubergine profonde : plus douce,
      // plus « manuscrite ». Les accents restent sourds et raffinés.
      colors: {
        ink: '#2B2733',
        'ink-soft': '#5B5468',
        paper: '#FBFAFF',
        'paper-warm': '#F6F3FB',
        lilac: {
          50: '#F4EFFB',
          100: '#E9E1F7',
          200: '#D8C9EF',
          300: '#C9B8E8',
          400: '#A98FD1',
          500: '#8B6FB0',
        },
        sage: {
          50: '#EEF6F1',
          100: '#E3F0E8',
          200: '#CDE4D6',
          300: '#B8D8C4',
          400: '#8FC0A2',
          500: '#68A583',
        },
      },
      fontFamily: {
        // Fraunces : serif littéraire, expressive, réservée aux titres et vers.
        display: ['Fraunces', 'Georgia', 'serif'],
        // Newsreader : corps de lecture chaleureux pour le texte des poèmes.
        reader: ['Newsreader', 'Georgia', 'serif'],
        // Inter : interface, boutons, méta-données.
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      maxWidth: {
        prose: '38rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,39,51,0.04), 0 12px 32px -12px rgba(139,111,176,0.18)',
        lift: '0 4px 8px rgba(43,39,51,0.05), 0 24px 48px -18px rgba(139,111,176,0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'drift': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(3%,-2%) scale(1.06)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'drift-slow': 'drift 22s ease-in-out infinite',
        'pop': 'pop 0.45s ease-out',
      },
    },
  },
  plugins: [],
};
