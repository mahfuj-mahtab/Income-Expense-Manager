import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </Text>
        <Text className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name || user?.email}
        </Text>

        <View className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Expense Tracker
          </Text>
          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your expense tracking features will appear here.
          </Text>
        </View>

        <Pressable
          className="mt-8 items-center rounded-xl bg-red-500 py-4 active:bg-red-600"
          onPress={handleLogout}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Log out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
