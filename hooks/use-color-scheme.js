import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppSelector } from '@/store/hooks';

export function useColorScheme() {
  const { preference, isLoaded } = useAppSelector((state) => state.theme);
  const systemScheme = useRNColorScheme();

  if (!isLoaded) {
    return 'light';
  }

  if (preference === 'system') {
    return systemScheme ?? 'light';
  }

  return preference;
}
