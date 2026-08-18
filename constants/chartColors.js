export const INCOME_COLORS = [
  '#16A34A',
  '#22C55E',
  '#4ADE80',
  '#15803D',
  '#059669',
  '#10B981',
  '#86EFAC',
  '#34D399',
];

export const EXPENSE_COLORS = [
  '#DC2626',
  '#EF4444',
  '#F87171',
  '#B91C1C',
  '#E11D48',
  '#F97316',
  '#FB7185',
  '#F59E0B',
];

export const PARTITION_COLORS = [
  '#133458',
  '#2563EB',
  '#7C3AED',
  '#0891B2',
  '#D97706',
  '#DB2777',
  '#059669',
  '#6366F1',
  '#14B8A6',
  '#A855F7',
];

export const UNALLOCATED_COLOR = '#F59E0B';

export function pickColor(colors, index) {
  return colors[index % colors.length];
}
