import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function AccountsSummaryHero({ summaries }) {
  if (!summaries.length) return null;

  return (
    <LinearGradient
      colors={palette.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mt-5 overflow-hidden rounded-sheet shadow-elevated">
      <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
      <View className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/10" />
      <View className="p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-white/70">
          Total holdings
        </Text>
        <View className="mt-3 gap-2">
          {summaries.map(([code, total]) => (
            <View key={code} className="flex-row items-baseline justify-between">
              <Text className="text-sm font-medium text-white/80">{code}</Text>
              <Text
                className="text-2xl font-bold text-white"
                style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(total, code)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

export function DateGroupHeader({ label, count }) {
  return (
    <View className="mb-3 flex-row items-center gap-3">
      <View className="rounded-full bg-primary px-3 py-1">
        <Text className="text-xs font-bold uppercase tracking-wide text-white">{label}</Text>
      </View>
      <Text className="text-xs font-semibold text-content-secondary dark:text-gray-400">
        {count} item{count === 1 ? '' : 's'}
      </Text>
    </View>
  );
}
