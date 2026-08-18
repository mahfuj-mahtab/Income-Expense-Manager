import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppSelector } from '@/store/hooks';

/**
 * Web hook respects persisted theme preference from Redux.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { preference, isLoaded } = useAppSelector((state) => state.theme);
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated || !isLoaded) {
    return 'light';
  }

  if (preference === 'system') {
    return systemScheme ?? 'light';
  }

  return preference;
}
