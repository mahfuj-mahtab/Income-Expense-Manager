import { Text, View } from 'react-native';

const accentStyles = {
  brand: 'bg-primary',
  income: 'bg-income-500',
  expense: 'bg-expense-500',
  warning: 'bg-warning-500',
  neutral: 'bg-primary-100',
};

const valueStyles = {
  brand: 'text-primary dark:text-primary-50',
  income: 'text-income-600 dark:text-income-500',
  expense: 'text-expense-600 dark:text-expense-500',
  warning: 'text-warning-600 dark:text-warning-500',
  neutral: 'text-content dark:text-white',
};

export function StatCard({ label, value, accent = 'neutral', className = '' }) {
  return (
    <View
      className={`min-w-0 flex-1 rounded-card border border-border/80 bg-surface p-3 shadow-card dark:border-border-dark dark:bg-surface-card ${className}`}>
      <View className={`h-1 w-7 rounded-full ${accentStyles[accent]}`} />
      <Text className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-content-secondary dark:text-gray-400">
        {label}
      </Text>
      <Text
        className={`mt-1 text-sm font-bold ${valueStyles[accent]}`}
        numberOfLines={2}
        style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
