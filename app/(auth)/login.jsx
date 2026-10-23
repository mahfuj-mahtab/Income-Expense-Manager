import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell } from '@/components/ui/AuthShell';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, login } from '@/store/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;

    dispatch(clearError());
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) {
      router.replace('/(app)/(tabs)');
    }
  };

  return (
    <AuthShell
      tagline="Your finances, organized with care"
      footer={
        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-white/75">Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable disabled={isLoading}>
              <Text className="text-sm font-semibold text-white">Sign up</Text>
            </Pressable>
          </Link>
        </View>
      }>
      <Card className="p-6">
        <Text className="text-xl font-bold text-content dark:text-white">Welcome back</Text>
        <Text className="mt-1 text-sm text-content-secondary dark:text-gray-400">
          Sign in to continue managing your money
        </Text>

        <View className="mt-6 gap-4">
          <FormField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <FormField label="Password">
            <View>
              <TextInput
                placeholder="Your password"
                secureTextEntry={!showPassword}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                className="pr-12"
              />
              <Pressable
                className="absolute right-3 top-3"
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <IconSymbol
                  name={showPassword ? 'eye.slash' : 'eye'}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </FormField>

          {error ? <Text className="text-sm text-expense-500">{error}</Text> : null}

          <PrimaryButton
            label="Sign in"
            onPress={handleLogin}
            loading={isLoading}
            disabled={!email.trim() || !password}
            className="mt-2"
          />
        </View>
      </Card>
    </AuthShell>
  );
}
