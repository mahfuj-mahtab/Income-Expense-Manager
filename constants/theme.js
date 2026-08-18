export const palette = {
  primary: '#133458',
  primaryLight: '#E8F0F8',
  income: '#16A34A',
  incomeLight: '#DCFCE7',
  expense: '#DC2626',
  expenseLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
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
