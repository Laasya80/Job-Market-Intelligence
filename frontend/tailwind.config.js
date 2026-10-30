/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        growth: {
          green: '#10b981',
          red: '#ef4444',
          orange: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
