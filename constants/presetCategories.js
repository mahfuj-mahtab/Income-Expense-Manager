export const PRESET_CATEGORIES = [
  { id: 'preset-salary', name: 'Salary', type: 'income' },
  { id: 'preset-freelance', name: 'Freelance', type: 'income' },
  { id: 'preset-gift', name: 'Gift', type: 'income' },
  { id: 'preset-other-income', name: 'Other income', type: 'income' },
  { id: 'preset-food', name: 'Food', type: 'expense' },
  { id: 'preset-transport', name: 'Transport', type: 'expense' },
  { id: 'preset-bills', name: 'Bills', type: 'expense' },
  { id: 'preset-shopping', name: 'Shopping', type: 'expense' },
  { id: 'preset-health', name: 'Health', type: 'expense' },
  { id: 'preset-other-expense', name: 'Other expense', type: 'expense' },
];

export function getPresetCategoriesByType(type) {
  return PRESET_CATEGORIES.filter((c) => c.type === type);
}

export function getCategoryById(id) {
  return PRESET_CATEGORIES.find((c) => c.id === id);
}
