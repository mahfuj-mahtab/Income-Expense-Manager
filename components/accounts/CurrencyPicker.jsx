import { CURRENCIES } from '@/constants/currencies';
import { Pressable, Text, View } from 'react-native';

export function CurrencyPicker({ value, onChange, disabled = false }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {CURRENCIES.map((currency) => {
        const selected = value === currency.code;
        return (
          <Pressable
            key={currency.code}
            className={`rounded-full border px-3 py-2 ${
              selected
                ? 'border-primary bg-primary-50 dark:bg-primary-600/20'
                : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
            } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
            onPress={() => onChange(currency.code)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={currency.code}
            accessibilityState={{ selected }}>
            <Text
              className={`text-sm font-medium ${
                selected
                  ? 'text-primary dark:text-primary-50'
                  : 'text-content-secondary dark:text-gray-300'
              }`}>
              {currency.symbol} {currency.code}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
