import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { TextInput } from '@/components/ui/TextInput';

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(iso) {
  if (!iso) return 'Select date';
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DatePickerField({ label, value, onChange, disabled = false }) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = value ? new Date(`${value}T00:00:00`) : new Date();

  const handleChange = (_event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(formatDateISO(selectedDate));
    }
  };

  return (
    <View>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-content-secondary dark:text-gray-300">
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Date'}: ${formatDisplayDate(value)}`}>
        <TextInput
          editable={false}
          pointerEvents="none"
          value={formatDisplayDate(value)}
          className={disabled ? 'opacity-50' : ''}
        />
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}
      {Platform.OS === 'ios' && showPicker ? (
        <Pressable
          onPress={() => setShowPicker(false)}
          className="mt-2 items-center rounded-xl bg-primary py-2">
          <Text className="font-semibold text-white">Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
