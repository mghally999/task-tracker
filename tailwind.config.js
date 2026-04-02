/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        navy: {
          DEFAULT: '#0d1b2a',
          50: '#e8edf3',
          100: '#c5d2df',
          200: '#9fb4c7',
          300: '#7896af',
          400: '#5a7e9c',
          500: '#3d678b',
          600: '#2f5377',
          700: '#1f3e61',
          800: '#102a4c',
          900: '#0d1b2a',
        },
        gold: {
          DEFAULT: '#c89b3c',
          50: '#fdf8ec',
          100: '#f9edcc',
          200: '#f3da99',
          300: '#edca6d',
          400: '#e6ba45',
          500: '#c89b3c',
          600: '#a67d2d',
          700: '#855f20',
          800: '#664715',
          900: '#4a310c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'cursor-blink': 'cursorBlink 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        cursorBlink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-gold': '0 0 20px rgba(200, 155, 60, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
};
