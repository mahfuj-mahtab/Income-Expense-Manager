import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, register } from '@/store/slices/authSlice';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState(null);

  const handleRegister = async () => {
    setValidationError(null);

    if (!name.trim() || !email.trim() || !password) {
      setValidationError('All fields are required.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    dispatch(clearError());
    const result = await dispatch(
      register({ name: name.trim(), email: email.trim(), password })
    );
    if (register.fulfilled.match(result)) {
      router.replace('/(app)/(tabs)');
    }
  };

  const displayError = validationError || error;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-1 justify-center px-6">
          <View className="mb-8 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-elevated">
              <Text className="text-2xl font-bold text-white">E</Text>
            </View>
            <Text className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Expense Tracker
            </Text>
            <Text className="mt-2 text-base text-gray-500 dark:text-gray-400">
              Create your account to get started
            </Text>
          </View>

          <View className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Create account
            </Text>

            <View className="mt-6 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </Text>
                <TextInput
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Your name"
                  placeholderTextColor="#9ca3af"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>

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
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  autoComplete="new-password"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
              </View>

              {displayError ? (
                <Text className="text-sm text-red-500">{displayError}</Text>
              ) : null}

              <PrimaryButton
                label="Sign up"
                onPress={handleRegister}
                loading={isLoading}
                disabled={!name.trim() || !email.trim() || !password}
                className="mt-2"
              />
            </View>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable disabled={isLoading}>
                <Text className="text-sm font-semibold text-brand-600">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
