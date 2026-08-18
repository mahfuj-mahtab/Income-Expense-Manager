import { Text, View } from 'react-native';

import { TextInput } from '@/components/ui/TextInput';

export function FormField({
  label,
  error,
  children,
  className = '',
  ...inputProps
}) {
  if (children) {
    return (
      <View className={className}>
        {label ? (
          <Text className="mb-1.5 text-sm font-medium text-content-secondary dark:text-gray-300">
            {label}
          </Text>
        ) : null}
        {children}
        {error ? <Text className="mt-1 text-sm text-expense-500">{error}</Text> : null}
      </View>
    );
  }

  return (
    <View className={className}>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-content-secondary dark:text-gray-300">
          {label}
        </Text>
      ) : null}
      <TextInput error={Boolean(error)} {...inputProps} />
      {error ? <Text className="mt-1 text-sm text-expense-500">{error}</Text> : null}
    </View>
  );
}
