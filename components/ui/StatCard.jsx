import { Text, View } from 'react-native';

const accentStyles = {
  brand: 'border-brand-500 bg-brand-50 dark:bg-brand-600/10',
  income: 'border-income-500 bg-income-50 dark:bg-income-500/10',
  expense: 'border-expense-500 bg-expense-50 dark:bg-expense-500/10',
  neutral: 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
};

const valueStyles = {
  brand: 'text-brand-700 dark:text-brand-100',
  income: 'text-income-600 dark:text-income-500',
  expense: 'text-expense-600 dark:text-expense-500',
  neutral: 'text-gray-900 dark:text-white',
};

export function StatCard({ label, value, accent = 'neutral', className = '' }) {
  return (
    <View
      className={`min-w-[100px] flex-1 rounded-2xl border-l-4 p-4 ${accentStyles[accent]} ${className}`}>
      <Text className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </Text>
      <Text className={`mt-1.5 text-lg font-bold ${valueStyles[accent]}`}>{value}</Text>
    </View>
  );
}
