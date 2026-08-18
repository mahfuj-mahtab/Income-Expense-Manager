import { Pressable, ScrollView, Text, View } from 'react-native';

export function ChipPicker({ label, options, value, onChange, disabled }) {
  return (
    <View>
      <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((option) => {
            const selected = value === option.id;
            return (
              <Pressable
                key={option.id}
                className={`rounded-lg border px-3 py-2 ${
                  selected
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-600/20'
                    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
                } ${disabled ? 'opacity-50' : ''}`}
                onPress={() => onChange(option.id, option.name)}
                disabled={disabled}>
                <Text
                  className={`text-sm font-medium ${
                    selected ? 'text-brand-700 dark:text-brand-100' : 'text-gray-700 dark:text-gray-300'
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
