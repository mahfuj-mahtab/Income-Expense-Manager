import { Pressable, Text } from 'react-native';

export function Chip({ label, selected = false, onPress, disabled = false }) {
  return (
    <Pressable
      className={`rounded-full border px-4 py-2 ${
        selected
          ? 'border-primary bg-primary'
          : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
      } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}>
      <Text
        className={`text-sm font-medium ${
          selected ? 'font-semibold text-white' : 'text-content-secondary dark:text-gray-300'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}
