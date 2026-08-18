import { useEffect } from 'react';

import { useAppDispatch } from '@/store/hooks';
import {
  applyThemePreference,
  loadThemePreference,
  setThemeLoaded,
} from '@/store/slices/themeSlice';

export function ThemeBootstrap({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadThemePreference().then((stored) => {
      dispatch(setThemeLoaded(stored));
      applyThemePreference(stored);
    });
  }, [dispatch]);

  return children;
}
