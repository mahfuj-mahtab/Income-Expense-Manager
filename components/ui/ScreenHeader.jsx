import { Text, View } from 'react-native';

export function ScreenHeader({ title, subtitle, action, greeting }) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        {greeting ? (
          <Text className="text-xs font-semibold uppercase tracking-widest text-content-secondary dark:text-gray-400">
            {greeting}
          </Text>
        ) : null}
        <Text className="text-[32px] font-bold leading-10 tracking-tight text-content dark:text-white">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1.5 text-sm leading-5 text-content-secondary dark:text-gray-400">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
