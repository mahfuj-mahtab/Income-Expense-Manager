import { Text, View } from 'react-native';

export function SectionHeader({ title, action, className = '' }) {
  return (
    <View className={`mb-3 flex-row items-center justify-between ${className}`}>
      <Text className="text-xs font-semibold uppercase tracking-widest text-content-secondary dark:text-gray-400">
        {title}
      </Text>
      {action}
    </View>
  );
}
