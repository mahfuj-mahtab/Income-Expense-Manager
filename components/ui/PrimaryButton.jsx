import { ActivityIndicator, Pressable, Text } from 'react-native';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  variant = 'brand',
}) {
  const variants = {
    brand: 'bg-brand-600 active:bg-brand-700',
    income: 'bg-income-600 active:bg-income-500',
    expense: 'bg-expense-600 active:bg-expense-500',
    danger: 'bg-red-600 active:bg-red-700',
  };

  return (
    <Pressable
      className={`items-center rounded-xl px-4 py-3 ${variants[variant]} disabled:opacity-60 ${className}`}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
