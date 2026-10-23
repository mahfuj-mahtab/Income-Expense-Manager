import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMonthLabel, isFutureMonth, shiftMonth } from '@/lib/analytics/dateRange';

export function MonthPicker({ year, month, onChange }) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? palette.primaryLight : palette.primary;
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
    <View className="mt-5 flex-row items-center justify-between rounded-card border border-border/80 bg-surface px-2 py-1.5 shadow-card dark:border-border-dark dark:bg-surface-card">
      <Pressable
        className="rounded-xl px-3 py-2 active:bg-primary-50 dark:active:bg-primary-600/20"
        onPress={handlePrev}
        accessibilityLabel="Previous month">
        <IconSymbol name="chevron.left" size={22} color={iconColor} />
      </Pressable>
      <Text className="text-base font-semibold text-content dark:text-white">
        {formatMonthLabel(year, month)}
      </Text>
      <Pressable
        className={`rounded-xl px-3 py-2 ${
          canGoNext ? 'active:bg-primary-50 dark:active:bg-primary-600/20' : 'opacity-30'
        }`}
        onPress={handleNext}
        disabled={!canGoNext}
        accessibilityLabel="Next month">
        <IconSymbol name="chevron.right" size={22} color={iconColor} />
      </Pressable>
    </View>
  );
}
