/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces — never pure #000, keeps depth in shadows/panels
        void: '#0a0a0b',        // near-black, page background
        graphite: '#151517',    // charcoal, panel background
        slate: '#1f2023',       // dark graphite, raised surfaces / cards
        line: '#2a2b2f',        // hairline borders on dark

        // Text
        bone: '#ede8df',        // warm white, primary text
        ash: '#9a978f',         // muted gray, secondary text

        // Accents — used sparingly, each with a specific job
        crimson: {
          DEFAULT: '#8c1f28',   // deep crimson — danger, emotional weight
          bright: '#b5202c',    // hover/active state only
        },
        gold: {
          DEFAULT: '#b08a3e',   // antique gold — legendary, achievement
          bright: '#d4af6a',
        },
        amber: '#a9772f',       // muted amber — secondary warm accent

        // Layer 2 cinematic opening background — deliberately darker
        // than `void`, per the birthday-opening spec (#060608)
        ink: '#060608',

        // Layer 3 — subtle desaturated purple, used sparingly in
        // game-mode backgrounds to mark the Act I/II -> Act III shift
        mist: '#4a3f55',

        // Exact game-mode background per the Layer 3 polish spec
        abyss: '#050506',
      },
      fontFamily: {
        // UI / body text
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        // Cinematic headings
        display: ['Cormorant Garamond', 'Cinzel', 'Playfair Display', 'serif'],
        // System / archive / stats text
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      transitionDuration: {
        ui: '250ms',        // normal UI
        unlock: '700ms',    // important unlocks
        emotional: '1500ms',// emotional moments
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
        drift: {
          '0%, 100%': { transform: 'translate(-50%, 0) scale(1)' },
          '50%': { transform: 'translate(-50%, 2%) scale(1.05)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-1%, 1%)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        grain: 'grain 8s steps(2) infinite',
        blink: 'blink 1s step-start infinite',
      },
    },
  },
  plugins: [],
}
