import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function EmptyState({ title, subtitle, actionLabel, onAction, icon }) {
  return (
    <View className="items-center py-10">
      {icon ? (
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-600/15">
          {icon}
        </View>
      ) : null}
      <Text className="text-lg font-semibold text-content dark:text-gray-200">{title}</Text>
      {subtitle ? (
        <Text className="mt-2 max-w-xs text-center text-sm text-content-secondary dark:text-gray-400">
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} className="mt-6 px-6" />
      ) : null}
    </View>
  );
}
