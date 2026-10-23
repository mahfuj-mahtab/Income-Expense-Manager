export const palette = {
  primary: '#133458',
  primaryLight: '#E8F0F8',
  primaryDeep: '#0B2036',
  heroGradient: ['#0B2036', '#134E6F', '#0F766E'],
  income: '#0F766E',
  incomeLight: '#CCFBF1',
  expense: '#DC2626',
  expenseLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  background: '#F4F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E4EAF2',
  darkBackground: '#0F172A',
  darkCard: '#1E293B',
  darkBorder: '#334155',
  darkText: '#F8FAFC',
  darkTextSecondary: '#94A3B8',
};

export const Colors = {
  light: {
    text: palette.text,
    background: palette.background,
    card: palette.card,
    border: palette.border,
    tint: palette.primary,
    icon: palette.textSecondary,
    tabIconDefault: palette.textSecondary,
    tabIconSelected: palette.primary,
  },
  dark: {
    text: palette.darkText,
    background: palette.darkBackground,
    card: palette.darkCard,
    border: palette.darkBorder,
    tint: palette.primaryLight,
    icon: palette.darkTextSecondary,
    tabIconDefault: palette.darkTextSecondary,
    tabIconSelected: palette.primaryLight,
  },
};

export const NavigationTheme = {
  light: {
    primary: palette.primary,
    background: palette.background,
    card: palette.card,
    text: palette.text,
    border: palette.border,
  },
  dark: {
    primary: palette.primaryLight,
    background: palette.darkBackground,
    card: palette.darkCard,
    text: palette.darkText,
    border: palette.darkBorder,
  },
};
