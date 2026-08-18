import { getCurrencySymbol } from '@/constants/currencies';

export function formatCurrency(amount, currencyCode) {
  const symbol = getCurrencySymbol(currencyCode);
  const formatted = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}
