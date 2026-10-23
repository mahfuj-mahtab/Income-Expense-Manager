import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text } from 'react-native';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  variant = 'brand',
  haptic = true,
}) {
  const variants = {
    brand: 'bg-primary active:bg-primary-600 shadow-glow',
    income: 'bg-income-600 active:bg-income-500',
    expense: 'bg-expense-600 active:bg-expense-500',
    danger: 'bg-expense-600 active:bg-expense-500',
  };

  return (
    <Pressable
      className={`items-center rounded-2xl px-4 py-4 ${variants[variant]} disabled:opacity-60 ${className}`}
      onPress={() => {
        if (haptic && !disabled && !loading) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
