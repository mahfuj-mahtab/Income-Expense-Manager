import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, login } from '@/store/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) return;

    dispatch(clearError());
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) {
      router.replace('/(app)/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </Text>
          <Text className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Sign in to your account
          </Text>

          <View className="mt-8 gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {error ? (
              <Text className="text-sm text-red-500">{error}</Text>
            ) : null}

            <Pressable
              className="mt-2 items-center rounded-xl bg-blue-600 py-4 active:bg-blue-700 disabled:opacity-60"
              onPress={handleLogin}
              disabled={isLoading || !email.trim() || !password}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Sign in</Text>
              )}
            </Pressable>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable disabled={isLoading}>
                <Text className="text-sm font-semibold text-blue-600">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
