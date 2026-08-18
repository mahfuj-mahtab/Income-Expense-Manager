import { Text, View } from 'react-native';

export function ScreenHeader({ title, subtitle, action }) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
