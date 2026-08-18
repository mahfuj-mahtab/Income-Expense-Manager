import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenContainer({ children, className = '' }) {
  return (
    <SafeAreaView className={`flex-1 bg-surface-bg dark:bg-surface-dark ${className}`}>
      {children}
    </SafeAreaView>
  );
}
