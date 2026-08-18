import { Text, View } from 'react-native';

const accentStyles = {
  brand: 'bg-primary-50 dark:bg-primary-600/15',
  income: 'bg-income-50 dark:bg-income-500/10',
  expense: 'bg-expense-50 dark:bg-expense-500/10',
  warning: 'bg-warning-50 dark:bg-warning-500/10',
  neutral: 'bg-surface-bg dark:bg-surface-dark',
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
    <View className={`min-w-[100px] flex-1 rounded-2xl p-4 ${accentStyles[accent]} ${className}`}>
      <Text className="text-xs font-medium uppercase tracking-wide text-content-secondary dark:text-gray-400">
        {label}
      </Text>
      <Text className={`mt-1.5 text-xl font-bold ${valueStyles[accent]}`}>{value}</Text>
    </View>
  );
}
