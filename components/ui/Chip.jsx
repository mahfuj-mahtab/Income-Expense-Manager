import { Pressable, Text } from 'react-native';

export function Chip({ label, selected = false, onPress, disabled = false }) {
  return (
    <Pressable
      className={`rounded-full border px-4 py-2 ${
        selected
          ? 'border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-600/20'
          : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
      } ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || !onPress}>
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-brand-700 dark:text-brand-100' : 'text-gray-700 dark:text-gray-300'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}
