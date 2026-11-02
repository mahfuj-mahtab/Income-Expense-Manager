import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Provider } from 'react-redux';
import '../global.css';

import { ThemeBootstrap } from '@/components/ThemeBootstrap';
import { LaunchSplash } from '@/components/ui/SplashScreen';
import { NavigationTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';

cssInterop(LinearGradient, { className: 'style' });

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(app)',
};

function AuthBootstrap({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return children;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? NavigationTheme.dark : NavigationTheme.light;

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: tokens.primary,
      background: tokens.background,
      card: tokens.card,
      text: tokens.text,
      border: tokens.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useSharedValue(1);
  const nativeHidden = useRef(false);

  const hideNativeSplash = useCallback(() => {
    if (nativeHidden.current) return;
    nativeHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return undefined;

    const fadeTimer = setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 400 });
    }, 600);
    const doneTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [fontError, fontsLoaded, splashOpacity]);

  const splashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  if (showSplash) {
    return (
      <View className="flex-1" style={{ backgroundColor: '#071E33' }}>
        <StatusBar style="light" />
        <Animated.View style={[{ flex: 1 }, splashStyle]}>
          <LaunchSplash fontsReady={Boolean(fontsLoaded)} onLayout={hideNativeSplash} />
        </Animated.View>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ThemeBootstrap>
        <AuthBootstrap>
          <RootLayoutNav />
        </AuthBootstrap>
      </ThemeBootstrap>
    </Provider>
  );
}
