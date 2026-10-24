import { Pressable, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function Chip({ label, selected = false, onPress, disabled = false }) {
  return (
    <Pressable
      className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
        selected
          ? 'border-primary bg-primary'
          : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
      } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}>
      {selected ? <IconSymbol name="checkmark" size={14} color="#FFFFFF" /> : null}
      <Text
        className={`text-sm ${
          selected ? 'font-semibold text-white' : 'font-medium text-content-secondary dark:text-gray-300'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}
