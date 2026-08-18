import { ScrollView, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';

export function CurrencyFilter({ currencies, value, onChange }) {
  if (currencies.length <= 1) return null;

  return (
    <View className="mt-4">
      <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Currency
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {currencies.map((currency) => (
            <Chip
              key={currency}
              label={currency}
              selected={value === currency}
              onPress={() => onChange(currency)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
