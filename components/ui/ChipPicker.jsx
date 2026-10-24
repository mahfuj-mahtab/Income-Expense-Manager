import { Pressable, ScrollView, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function ChipPicker({ label, options, value, onChange, disabled }) {
  return (
    <View>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-content-secondary dark:text-gray-300">
          {label}
        </Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((option) => {
            const selected = value === option.id;
            return (
              <Pressable
                key={option.id}
                className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
                  selected
                    ? 'border-primary bg-primary'
                    : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
                } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
                onPress={() => onChange(option.id, option.name)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={option.name}
                accessibilityState={{ selected }}>
                {selected ? <IconSymbol name="checkmark" size={14} color="#FFFFFF" /> : null}
                <Text
                  className={`text-sm ${
                    selected
                      ? 'font-semibold text-white'
                      : 'font-medium text-content-secondary dark:text-gray-300'
                  }`}>
                  {option.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
