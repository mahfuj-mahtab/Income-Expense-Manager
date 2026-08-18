import { createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

const THEME_KEY = 'app_color_scheme';

const initialState = {
  preference: 'system',
  isLoaded: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeLoaded: (state, action) => {
      state.isLoaded = true;
      state.preference = action.payload;
    },
    setThemePreference: (state, action) => {
      state.preference = action.payload;
    },
  },
});

export const { setThemeLoaded, setThemePreference } = themeSlice.actions;

export async function loadThemePreference() {
  try {
    const stored = await SecureStore.getItemAsync(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // ignore
  }
  return 'system';
}

export async function persistThemePreference(preference) {
  try {
    await SecureStore.setItemAsync(THEME_KEY, preference);
  } catch {
    // ignore
  }
}

export function applyThemePreference(preference) {
  if (preference === 'system') {
    Appearance.setColorScheme(null);
  } else {
    Appearance.setColorScheme(preference);
  }
}

export default themeSlice.reducer;
