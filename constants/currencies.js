export const CURRENCIES = [
  { code: 'BDT', label: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
];

export function getCurrencySymbol(code) {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? code;
}
