import { Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function TransactionRow({
  categoryName,
  accountName,
  partitionName,
  amount,
  currency,
  type,
  note,
  onPress,
  onDelete,
}) {
  const isIncome = type === 'income';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${categoryName}, ${isIncome ? '+' : '-'}${formatCurrency(amount, currency)}`}
      className="active:scale-[0.98]">
      <View
        className={`flex-row items-center gap-3 rounded-2xl border p-3.5 shadow-card ${
          isIncome
            ? 'border-income-500/25 bg-surface dark:border-income-500/20 dark:bg-surface-card'
            : 'border-expense-500/25 bg-surface dark:border-expense-500/20 dark:bg-surface-card'
        }`}>
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${
            isIncome
              ? 'bg-income-50 dark:bg-income-500/20'
              : 'bg-expense-50 dark:bg-expense-500/20'
          }`}>
          <IconSymbol
            name={isIncome ? 'arrow.up' : 'arrow.down'}
            size={22}
            color={isIncome ? '#16A34A' : '#DC2626'}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text
            className="text-base font-bold text-content dark:text-white"
            numberOfLines={1}>
            {categoryName}
          </Text>
          <Text
            className="mt-0.5 text-sm font-medium text-content-secondary dark:text-gray-300"
            numberOfLines={1}>
            {accountName} · {partitionName}
          </Text>
          {note ? (
            <Text
              className="mt-1 text-xs text-content-secondary dark:text-gray-400"
              numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </View>

        <View className="items-end gap-2">
          <Text
            className={`text-lg font-bold ${
              isIncome
                ? 'text-income-600 dark:text-income-500'
                : 'text-expense-600 dark:text-expense-500'
            }`}>
            {isIncome ? '+' : '-'}
            {formatCurrency(amount, currency)}
          </Text>
          <IconButton
            icon="trash"
            onPress={onDelete}
            accessibilityLabel="Delete transaction"
            size={32}
            color="#DC2626"
            haptic
          />
        </View>
      </View>
    </Pressable>
  );
}
