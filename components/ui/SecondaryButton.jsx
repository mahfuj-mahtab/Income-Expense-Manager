import { Pressable, Text } from 'react-native';

export function SecondaryButton({ label, onPress, disabled = false, className = '' }) {
  return (
    <Pressable
      className={`items-center rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-900 disabled:opacity-60 ${className}`}
      onPress={onPress}
      disabled={disabled}>
      <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">{label}</Text>
    </Pressable>
  );
}
