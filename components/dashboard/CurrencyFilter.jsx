import { ScrollView, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function CurrencyFilter({ currencies, value, onChange }) {
  if (currencies.length <= 1) return null;

  return (
    <View className="mt-4">
      <SectionHeader title="Currency" />
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
