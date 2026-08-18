const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getCurrentMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function formatMonthLabel(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function shiftMonth(year, month, delta) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function isFutureMonth(year, month) {
  const current = getCurrentMonth();
  if (year > current.year) return true;
  if (year === current.year && month > current.month) return true;
  return false;
}

export function getMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function transactionInMonth(transaction, year, month) {
  if (!transaction?.date) return false;
  const monthKey = getMonthKey(year, month);
  return transaction.date.startsWith(monthKey);
}
