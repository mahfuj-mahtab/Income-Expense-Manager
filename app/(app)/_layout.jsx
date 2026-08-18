import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/store/hooks';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-bg dark:bg-surface-dark">
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack key={user?.$id} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="account/[id]"
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: palette.primary,
          headerStyle: {
            backgroundColor: isDark ? palette.darkCard : palette.background,
          },
          headerTitleStyle: {
            color: isDark ? palette.darkText : palette.text,
          },
          headerShadowVisible: false,
          title: 'Account',
        }}
      />
    </Stack>
  );
}
