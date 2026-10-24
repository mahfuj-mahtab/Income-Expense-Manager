import { Pressable, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { CURRENCIES } from '@/constants/currencies';

export function CurrencyPicker({ value, onChange, disabled = false }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {CURRENCIES.map((currency) => {
        const selected = value === currency.code;
        return (
          <Pressable
            key={currency.code}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              selected
                ? 'border-primary bg-primary'
                : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
            } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
            onPress={() => onChange(currency.code)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={currency.code}
            accessibilityState={{ selected }}>
            {selected ? <IconSymbol name="checkmark" size={14} color="#FFFFFF" /> : null}
            <Text
              className={`text-sm ${
                selected
                  ? 'font-semibold text-white'
                  : 'font-medium text-content-secondary dark:text-gray-300'
              }`}>
              {currency.symbol} {currency.code}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
