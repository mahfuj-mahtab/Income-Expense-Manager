import { TextInput as RNTextInput } from 'react-native';

export function TextInput({
  className = '',
  error = false,
  ...props
}) {
  return (
    <RNTextInput
      className={`h-12 rounded-xl border bg-surface px-4 text-base text-content dark:bg-surface-card dark:text-white ${
        error
          ? 'border-expense-500'
          : 'border-border focus:border-primary dark:border-border-dark'
      } ${className}`}
      placeholderTextColor="#94A3B8"
      {...props}
    />
  );
}
