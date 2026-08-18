import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function CategoryPieChart({ title, data, currency, emptyMessage }) {
  const colorScheme = useColorScheme();
  const innerColor = colorScheme === 'dark' ? '#1E293B' : '#FFFFFF';
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <Card className="mt-4">
        <SectionHeader title={title} />
        <EmptyState title={emptyMessage} />
      </Card>
    );
  }

  const pieData = data.map((item) => ({
    value: item.value,
    color: item.color,
    text: item.label,
  }));

  return (
    <Card className="mt-4">
      <SectionHeader title={title} />
      <View className="mt-2 items-center">
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={55}
          innerCircleColor={innerColor}
          centerLabelComponent={() => (
            <View className="items-center">
              <Text className="text-xs text-content-secondary dark:text-gray-400">Total</Text>
              <Text className="text-sm font-bold text-content dark:text-white">
                {formatCurrency(total, currency)}
              </Text>
            </View>
          )}
        />
      </View>
      <View className="mt-4 gap-2">
        {data.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <View key={item.label} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-sm text-content-secondary dark:text-gray-300">
                  {item.label}
                </Text>
              </View>
              <Text className="text-sm font-medium text-content dark:text-white">
                {formatCurrency(item.value, currency)} ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
