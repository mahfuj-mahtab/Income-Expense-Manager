import { Pressable, ScrollView, Text, View } from 'react-native';

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
                className={`rounded-full border px-3.5 py-2 ${
                  selected
                    ? 'border-primary bg-primary-50 dark:bg-primary-600/20'
                    : 'border-border bg-surface dark:border-border-dark dark:bg-surface-card'
                } ${disabled ? 'opacity-50' : 'active:opacity-80'}`}
                onPress={() => onChange(option.id, option.name)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={option.name}
                accessibilityState={{ selected }}>
                <Text
                  className={`text-sm font-medium ${
                    selected
                      ? 'text-primary dark:text-primary-50'
                      : 'text-content-secondary dark:text-gray-300'
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
