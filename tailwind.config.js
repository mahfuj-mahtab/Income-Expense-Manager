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
          50: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
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
          bg: '#F8FAFC',
          dark: '#0F172A',
          card: '#1E293B',
        },
        content: {
          DEFAULT: '#0F172A',
          secondary: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(19, 52, 88, 0.06), 0 1px 2px -1px rgba(19, 52, 88, 0.06)',
        elevated: '0 4px 16px 0 rgba(19, 52, 88, 0.1)',
        glow: '0 4px 14px 0 rgba(19, 52, 88, 0.25)',
      },
    },
  },
  plugins: [],
};
