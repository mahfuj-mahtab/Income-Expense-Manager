import { Pressable, Text } from 'react-native';

export function Chip({ label, selected = false, onPress, disabled = false }) {
  return (
    <Pressable
      className={`rounded-full border px-4 py-2 ${
        selected
          ? 'border-primary bg-primary-50 dark:border-primary-50 dark:bg-primary-600/20'
          : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
      } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}>
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-primary dark:text-primary-50' : 'text-content-secondary dark:text-gray-300'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}
