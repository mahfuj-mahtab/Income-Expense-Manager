import { Text, View } from 'react-native';

const containerVariants = {
  income: 'bg-income-50 dark:bg-income-500/20',
  expense: 'bg-expense-50 dark:bg-expense-500/20',
  warning: 'bg-warning-50 dark:bg-warning-500/20',
  neutral: 'bg-primary-50 dark:bg-primary-600/25',
  light: 'bg-white/20',
  default: 'bg-surface-bg dark:bg-surface-dark',
};

const textVariants = {
  income: 'text-income-600 dark:text-income-500',
  expense: 'text-expense-600 dark:text-expense-500',
  warning: 'text-warning-600 dark:text-warning-500',
  neutral: 'text-primary dark:text-primary-50',
  light: 'text-white',
  default: 'text-content-secondary dark:text-gray-300',
};

export function Badge({ label, variant = 'default', className = '' }) {
  return (
    <View className={`rounded-full px-2.5 py-1 ${containerVariants[variant]} ${className}`}>
      <Text className={`text-xs font-bold uppercase tracking-wide ${textVariants[variant]}`}>
        {label}
      </Text>
    </View>
  );
}
