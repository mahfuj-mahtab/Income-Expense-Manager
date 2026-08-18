export const INCOME_COLORS = [
  '#16a34a',
  '#22c55e',
  '#4ade80',
  '#15803d',
  '#166534',
  '#86efac',
  '#059669',
  '#10b981',
];

export const EXPENSE_COLORS = [
  '#dc2626',
  '#ef4444',
  '#f87171',
  '#b91c1c',
  '#991b1b',
  '#fb7185',
  '#e11d48',
  '#f97316',
];

export const PARTITION_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0891b2',
  '#d97706',
  '#db2777',
  '#059669',
  '#6366f1',
  '#ea580c',
  '#14b8a6',
  '#a855f7',
];

export const UNALLOCATED_COLOR = '#f59e0b';

export function pickColor(colors, index) {
  return colors[index % colors.length];
}
