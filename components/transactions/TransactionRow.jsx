import { Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/constants/theme';
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
      <View className="flex-row items-center gap-3 rounded-card border border-border/80 bg-surface p-3.5 shadow-card dark:border-border-dark dark:bg-surface-card">
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${
            isIncome
              ? 'bg-income-50 dark:bg-income-500/20'
              : 'bg-expense-50 dark:bg-expense-500/20'
          }`}>
          <IconSymbol
            name={isIncome ? 'arrow.up' : 'arrow.down'}
            size={20}
            color={isIncome ? palette.income : palette.expense}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text
            className="text-base font-semibold text-content dark:text-white"
            numberOfLines={1}>
            {categoryName}
          </Text>
          <Text
            className="mt-0.5 text-sm text-content-secondary dark:text-gray-400"
            numberOfLines={1}>
            {accountName} · {partitionName}
          </Text>
          {note ? (
            <Text
              className="mt-1 text-xs text-content-secondary dark:text-gray-500"
              numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </View>

        <View className="items-end gap-1.5">
          <Text
            className={`text-base font-bold ${
              isIncome
                ? 'text-income-600 dark:text-income-500'
                : 'text-expense-600 dark:text-expense-500'
            }`}
            style={{ fontVariant: ['tabular-nums'] }}>
            {isIncome ? '+' : '-'}
            {formatCurrency(amount, currency)}
          </Text>
          <IconButton
            icon="trash"
            onPress={onDelete}
            accessibilityLabel="Delete transaction"
            size={30}
            color={palette.expense}
            haptic
          />
        </View>
      </View>
    </Pressable>
  );
}
