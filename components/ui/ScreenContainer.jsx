import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenContainer({ children, className = '' }) {
  return (
    <SafeAreaView className={`flex-1 bg-gray-50 dark:bg-gray-950 ${className}`}>
      {children}
    </SafeAreaView>
  );
}
