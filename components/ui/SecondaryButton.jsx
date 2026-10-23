import { Pressable, Text } from 'react-native';

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  className = '',
  variant = 'outline',
}) {
  const variants = {
    outline:
      'border border-border bg-surface dark:border-border-dark dark:bg-surface-card',
    ghost: 'bg-transparent',
    danger: 'border border-expense-500/40 bg-expense-50 dark:bg-expense-500/10',
  };

  const textVariants = {
    outline: 'text-content dark:text-gray-200',
    ghost: 'text-content-secondary dark:text-gray-300',
    danger: 'text-expense-600 dark:text-expense-500',
  };

  return (
    <Pressable
      className={`items-center rounded-2xl px-4 py-4 ${variants[variant]} disabled:opacity-60 ${className}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text className={`text-base font-semibold ${textVariants[variant]}`}>{label}</Text>
    </Pressable>
  );
}
