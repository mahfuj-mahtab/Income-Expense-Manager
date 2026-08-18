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
            className={`rounded-lg border px-3 py-2 ${
              selected
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-gray-600'
            } ${disabled ? 'opacity-50' : ''}`}
            onPress={() => onChange(currency.code)}
            disabled={disabled}>
            <Text
              className={`text-sm font-medium ${
                selected ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
              {currency.symbol} {currency.code}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
