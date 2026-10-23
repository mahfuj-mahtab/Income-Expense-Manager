import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';
import { outstandingAmount } from '@/lib/debts/balance';
import { parseLocalDate } from '@/lib/ui/localDate';

const STATUS_VARIANT = {
  open: 'warning',
  partial: 'neutral',
  repaid: 'income',
};

function formatShortDate(value) {
  const date = parseLocalDate(value);
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DebtCard({
  debt,
  accountName,
  partitionName,
  currency,
  repayments,
  onRepay,
  onDelete,
}) {
  const outstanding = outstandingAmount(debt.amount, debt.repaidAmount);
  const repaid = Number(debt.repaidAmount) || 0;
  const progress = debt.amount > 0 ? Math.min((repaid / debt.amount) * 100, 100) : 0;
  const status = debt.status || 'open';
  const canRepay = outstanding > 0;

  return (
    <View className="rounded-card border border-border/80 bg-surface p-4 shadow-card dark:border-border-dark dark:bg-surface-card">
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="min-w-0 flex-1 text-base font-bold text-content dark:text-white"
              numberOfLines={1}>
              {debt.person}
            </Text>
            <Badge label={status} variant={STATUS_VARIANT[status] || 'default'} />
          </View>
          <Text
            className="mt-0.5 text-sm text-content-secondary dark:text-gray-400"
            numberOfLines={1}>
            {accountName} · {partitionName}
          </Text>
          {debt.note ? (
            <Text
              className="mt-1 text-xs text-content-secondary dark:text-gray-400"
              numberOfLines={2}>
              {debt.note}
            </Text>
          ) : null}
        </View>
        <IconButton
          icon="trash"
          onPress={onDelete}
          accessibilityLabel="Delete debt"
          size={32}
          color={palette.expense}
          haptic
        />
      </View>

      <View className="mt-4">
        <View className="h-1.5 overflow-hidden rounded-full bg-warning-50 dark:bg-warning-500/20">
          <View className="h-1.5 rounded-full bg-income-500" style={{ width: `${progress}%` }} />
        </View>
        <Text className="mt-1.5 text-xs font-medium text-content-secondary dark:text-gray-400">
          {progress.toFixed(0)}% repaid
        </Text>
      </View>

      <View className="mt-3 flex-row items-end justify-between">
        <View className="min-w-0 flex-1 pr-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-content-secondary dark:text-gray-400">
            Outstanding
          </Text>
          <Text
            className="text-lg font-bold text-warning-600 dark:text-warning-500"
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatCurrency(outstanding, currency)}
          </Text>
          <Text className="text-xs text-content-secondary dark:text-gray-400">
            of {formatCurrency(debt.amount, currency)} · returns to {partitionName}
          </Text>
        </View>
        {canRepay ? (
          <SecondaryButton label="Repay" onPress={onRepay} className="px-4 py-3" />
        ) : null}
      </View>

      {repayments.length > 0 ? (
        <View className="mt-3 gap-2 border-t border-border pt-3 dark:border-border-dark">
          <Text className="text-xs font-semibold uppercase tracking-wide text-content-secondary dark:text-gray-400">
            Repayments
          </Text>
          {repayments.map((repayment) => (
            <View key={repayment.$id} className="flex-row items-center justify-between">
              <Text className="flex-1 pr-3 text-sm text-content-secondary dark:text-gray-300">
                {formatShortDate(repayment.date)}
                {repayment.note ? ` · ${repayment.note}` : ''}
              </Text>
              <Text
                className="text-sm font-semibold text-income-600 dark:text-income-500"
                style={{ fontVariant: ['tabular-nums'] }}>
                +{formatCurrency(repayment.amount, currency)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
