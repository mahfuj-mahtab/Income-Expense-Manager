import { normalizeDateKey, parseLocalDate } from '@/lib/ui/localDate';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDateGroupLabel(isoDate) {
  const date = parseLocalDate(isoDate);
  if (!date) return 'Unknown date';

  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function groupByDate(items, dateKey = 'date') {
  const groups = {};

  items.forEach((item) => {
    const key = normalizeDateKey(item[dateKey]) || 'unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, groupItems]) => ({
      date,
      label: formatDateGroupLabel(date),
      items: groupItems,
    }));
}
