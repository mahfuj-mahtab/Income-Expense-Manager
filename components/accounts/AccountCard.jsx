import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

const AVATAR_COLORS = [
  { bg: 'bg-primary-50 dark:bg-primary-600/25', text: 'text-primary dark:text-primary-50' },
  { bg: 'bg-income-50 dark:bg-income-500/20', text: 'text-income-600 dark:text-income-500' },
  { bg: 'bg-warning-50 dark:bg-warning-500/20', text: 'text-warning-600 dark:text-warning-500' },
];

export function AccountCard({
  name,
  currency,
  balance,
  index = 0,
  onPress,
  onEdit,
  onDelete,
}) {
  const avatar = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatCurrency(balance, currency)}`}
      className="active:scale-[0.98]">
      <View className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated dark:border-border-dark dark:bg-surface-card">
        <View className="h-1 bg-primary" />
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <View
                className={`h-12 w-12 items-center justify-center rounded-2xl ${avatar.bg}`}>
                <Text className={`text-lg font-bold ${avatar.text}`}>
                  {currency.slice(0, 1)}
                </Text>
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  className="text-lg font-bold text-content dark:text-white"
                  numberOfLines={1}>
                  {name}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Badge label={currency} variant="neutral" />
                  <Text className="text-xs font-medium text-content-secondary dark:text-gray-400">
                    Bank account
                  </Text>
                </View>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#94A3B8" />
          </View>

          <View className="mt-4 flex-row items-end justify-between border-t border-border/60 pt-3 dark:border-border-dark/60">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-content-secondary dark:text-gray-400">
                Balance
              </Text>
              <Text className="mt-0.5 text-2xl font-bold text-primary dark:text-white">
                {formatCurrency(balance, currency)}
              </Text>
            </View>
            <View className="flex-row gap-1">
              <IconButton
                icon="pencil"
                onPress={onEdit}
                accessibilityLabel="Edit account"
                size={38}
              />
              <IconButton
                icon="trash"
                onPress={onDelete}
                accessibilityLabel="Delete account"
                size={38}
                color="#DC2626"
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
