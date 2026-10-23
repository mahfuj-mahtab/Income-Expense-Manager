/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        card: '22px',
        sheet: '28px',
      },
      colors: {
        primary: {
          DEFAULT: '#133458',
          50: '#E8F0F8',
          100: '#D1E3F1',
          500: '#133458',
          600: '#0F2A47',
          700: '#0B2036',
        },
        brand: {
          50: '#E8F0F8',
          100: '#D1E3F1',
          500: '#3b82f6',
          600: '#133458',
          700: '#0F2A47',
        },
        income: {
          50: '#CCFBF1',
          500: '#14B8A6',
          600: '#0F766E',
        },
        expense: {
          50: '#FEE2E2',
          500: '#DC2626',
          600: '#B91C1C',
        },
        warning: {
          50: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F4F7FB',
          dark: '#0F172A',
          card: '#1E293B',
        },
        content: {
          DEFAULT: '#0F172A',
          secondary: '#64748B',
        },
        border: {
          DEFAULT: '#E4EAF2',
          dark: '#334155',
        },
      },
      boxShadow: {
        card: '0 10px 28px -16px rgba(19, 52, 88, 0.28)',
        elevated: '0 18px 40px -18px rgba(11, 32, 54, 0.38)',
        glow: '0 10px 24px -8px rgba(19, 52, 88, 0.5)',
      },
    },
  },
  plugins: [],
};
