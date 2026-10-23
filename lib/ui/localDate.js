const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayLocalDate() {
  return toLocalDateString(new Date());
}

export function normalizeDateKey(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (DATE_ONLY.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return toLocalDateString(parsed);
}

export function parseLocalDate(value) {
  const key = normalizeDateKey(value);
  if (!key) return null;
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}
