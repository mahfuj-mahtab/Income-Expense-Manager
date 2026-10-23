import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { StatCard } from '@/components/ui/StatCard';
import { palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function HeroBalanceCard({ balance, currency, label = 'Total balance' }) {
  return (
    <LinearGradient
      colors={palette.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mt-5 overflow-hidden rounded-sheet shadow-elevated">
      <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <View className="absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-white/10" />
      <View className="p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {label}
        </Text>
        <Text
          className="mt-2 text-4xl font-bold text-white"
          style={{ fontVariant: ['tabular-nums'] }}>
          {formatCurrency(balance, currency)}
        </Text>
        <Text className="mt-2 text-sm font-medium text-white/70">{currency}</Text>
      </View>
    </LinearGradient>
  );
}

export function AnalyticsSummary({ totals, currency }) {
  return (
    <View className="mt-3 flex-row gap-2">
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
    </View>
  );
}
