import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function ListItem({
  title,
  subtitle,
  value,
  valueColor,
  left,
  onPress,
  showChevron = false,
  right,
  className = '',
  accessibilityLabel,
  variant = 'default',
}) {
  const variants = {
    default: 'border-border bg-surface dark:border-border-dark dark:bg-surface-card',
    income: 'border-income-500/30 bg-income-50/40 dark:border-income-500/25 dark:bg-income-500/10',
    expense: 'border-expense-500/30 bg-expense-50/40 dark:border-expense-500/25 dark:bg-expense-500/10',
    accent: 'border-primary/20 bg-primary-50/50 dark:border-primary-50/20 dark:bg-primary-600/10',
  };

  const content = (
    <View
      className={`flex-row items-center gap-3 rounded-2xl border p-4 shadow-card ${variants[variant]} ${className}`}>
      {left ? <View>{left}</View> : null}
      <View className="min-w-0 flex-1">
        <Text
          className="text-base font-bold text-content dark:text-white"
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="mt-0.5 text-sm font-medium text-content-secondary dark:text-gray-300"
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-2">
        {value ? (
          <Text
            className={`text-lg font-bold ${valueColor ?? 'text-content dark:text-white'}`}>
            {value}
          </Text>
        ) : null}
        {right ? (
          <View className="flex-row items-center gap-1">{right}</View>
        ) : showChevron ? (
          <IconSymbol name="chevron.right" size={18} color="#64748B" />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        className="active:scale-[0.98]">
        {content}
      </Pressable>
    );
  }

  return content;
}
