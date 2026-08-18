import { View } from 'react-native';

export function Card({ children, className = '' }) {
  return (
    <View
      className={`rounded-2xl border border-gray-200/80 bg-white p-4 shadow-card dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      {children}
    </View>
  );
}
