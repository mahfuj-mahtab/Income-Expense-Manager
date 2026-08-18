import { View } from 'react-native';

import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

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
