import { Pressable, Text, View } from 'react-native';

import { formatMonthLabel, isFutureMonth, shiftMonth } from '@/lib/analytics/dateRange';

export function MonthPicker({ year, month, onChange }) {
  const next = shiftMonth(year, month, 1);
  const canGoNext = !isFutureMonth(next.year, next.month);

  const handlePrev = () => {
    onChange(shiftMonth(year, month, -1));
  };

  const handleNext = () => {
    if (canGoNext) {
      onChange(next);
    }
  };

  return (
    <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-gray-200/80 bg-white px-2 py-2 shadow-card dark:border-gray-800 dark:bg-gray-900">
      <Pressable
        className="rounded-xl px-4 py-2 active:bg-gray-100 dark:active:bg-gray-800"
        onPress={handlePrev}>
        <Text className="text-lg font-semibold text-brand-600">←</Text>
      </Pressable>
      <Text className="text-base font-semibold text-gray-900 dark:text-white">
        {formatMonthLabel(year, month)}
      </Text>
      <Pressable
        className={`rounded-xl px-4 py-2 ${canGoNext ? 'active:bg-gray-100 dark:active:bg-gray-800' : 'opacity-30'}`}
        onPress={handleNext}
        disabled={!canGoNext}>
        <Text className="text-lg font-semibold text-brand-600">→</Text>
      </Pressable>
    </View>
  );
}
