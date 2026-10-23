import { ScrollView, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function PartitionPieChart({
  accounts,
  selectedAccountId,
  onSelectAccount,
  data,
  currency,
}) {
  const colorScheme = useColorScheme();
  const innerColor = colorScheme === 'dark' ? palette.darkCard : palette.card;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="mt-4">
      <SectionHeader title="Partition allocation" />
      <Text className="text-sm text-content-secondary dark:text-gray-400">
        Current balance split by partition
      </Text>

      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          subtitle="Create a bank account to see partition allocation"
        />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-2">
              {accounts.map((account) => (
                <Chip
                  key={account.$id}
                  label={account.name}
                  selected={selectedAccountId === account.$id}
                  onPress={() => onSelectAccount(account.$id)}
                />
              ))}
            </View>
          </ScrollView>

          {data.length === 0 || total === 0 ? (
            <EmptyState
              title="No partition data"
              subtitle="Add partitions to this account to see allocation"
            />
          ) : (
            <>
              <View className="mt-4 items-center">
                <PieChart
                  data={data.map((item) => ({
                    value: item.value,
                    color: item.color,
                    text: item.label,
                  }))}
                  donut
                  radius={90}
                  innerRadius={55}
                  innerCircleColor={innerColor}
                  centerLabelComponent={() => (
                    <View className="items-center">
                      <Text className="text-xs text-content-secondary dark:text-gray-400">
                        Total
                      </Text>
                      <Text className="text-sm font-bold text-content dark:text-white">
                        {formatCurrency(total, currency)}
                      </Text>
                    </View>
                  )}
                />
              </View>
              <View className="mt-5 gap-3">
                {data.map((item) => {
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <View key={item.label} className="flex-row items-center justify-between">
                      <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-3">
                        <View
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Text
                          className="text-sm text-content-secondary dark:text-gray-300"
                          numberOfLines={1}>
                          {item.label}
                        </Text>
                      </View>
                      <Text
                        className="text-sm font-semibold text-content dark:text-white"
                        style={{ fontVariant: ['tabular-nums'] }}>
                        {formatCurrency(item.value, currency)} ({percentage}%)
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </>
      )}
    </Card>
  );
}
