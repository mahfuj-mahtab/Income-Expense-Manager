import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function CategoryPieChart({ title, data, currency, emptyMessage }) {
  const colorScheme = useColorScheme();
  const innerColor = colorScheme === 'dark' ? '#111827' : '#ffffff';
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <Card className="mt-4">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">{title}</Text>
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
      <Text className="text-base font-semibold text-gray-900 dark:text-white">{title}</Text>
      <View className="mt-4 items-center">
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={55}
          innerCircleColor={innerColor}
          centerLabelComponent={() => (
            <View className="items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400">Total</Text>
              <Text className="text-sm font-bold text-gray-900 dark:text-white">
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
                <Text className="text-sm text-gray-700 dark:text-gray-300">{item.label}</Text>
              </View>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.value, currency)} ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
