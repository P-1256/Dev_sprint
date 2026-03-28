/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0e0f11',
          50: '#f5f5f6',
          100: '#e8e9eb',
          200: '#c5c7cc',
          300: '#9fa3ab',
          400: '#6b7280',
          500: '#4b5260',
          600: '#363c48',
          700: '#252b36',
          800: '#181d26',
          900: '#0e0f11',
        },
        sage: {
          DEFAULT: '#7ec8a4',
          50: '#f0faf5',
          100: '#d6f2e5',
          200: '#aee5cb',
          300: '#7ec8a4',
          400: '#55b082',
          500: '#3a9669',
          600: '#2d7854',
          700: '#265f43',
          800: '#1f4c36',
          900: '#193e2c',
        },
        amber: {
          DEFAULT: '#f5a623',
          50: '#fef9ee',
          100: '#fdefd0',
          200: '#fada9a',
          300: '#f7c15f',
          400: '#f5a623',
          500: '#e88d0a',
          600: '#c47008',
          700: '#9e580b',
          800: '#7f4610',
          900: '#693b10',
        },
        rose: {
          DEFAULT: '#f87171',
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#f87171',
          400: '#f44',
          500: '#e62e2e',
          600: '#c41f1f',
          700: '#a01818',
          800: '#841414',
          900: '#6e1313',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      }
    },
  },
  plugins: [],
}
