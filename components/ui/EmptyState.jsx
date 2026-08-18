import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <View className="items-center py-10">
      <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</Text>
      {subtitle ? (
        <Text className="mt-2 max-w-xs text-center text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          className="mt-6 px-6"
        />
      ) : null}
    </View>
  );
}
