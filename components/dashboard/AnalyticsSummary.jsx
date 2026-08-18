import { Text, View } from 'react-native';

import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function HeroBalanceCard({ balance, currency, label = 'Total balance' }) {
  return (
    <View className="mt-4 rounded-2xl bg-primary-50 p-5 dark:bg-primary-600/15">
      <Text className="text-sm font-medium text-content-secondary dark:text-gray-400">
        {label}
      </Text>
      <Text className="mt-1 text-3xl font-bold text-primary dark:text-white">
        {formatCurrency(balance, currency)}
      </Text>
    </View>
  );
}

export function AnalyticsSummary({ totals, balance, currency }) {
  return (
    <View className="mt-4 flex-row flex-wrap gap-3">
      <StatCard
        label="Income"
        value={formatCurrency(totals.income, currency)}
        accent="income"
      />
      <StatCard
        label="Expense"
        value={formatCurrency(totals.expense, currency)}
        accent="expense"
      />
      <StatCard
        label="Net"
        value={formatCurrency(totals.net, currency)}
        accent={totals.net >= 0 ? 'brand' : 'expense'}
      />
      <StatCard
        label="Balance"
        value={formatCurrency(balance, currency)}
        accent="neutral"
      />
    </View>
  );
}
