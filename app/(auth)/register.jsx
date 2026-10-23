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
import { clearError, register } from '@/store/slices/authSlice';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthShell
      tagline="Start your journey to better finances"
      footer={
        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-white/75">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable disabled={isLoading}>
              <Text className="text-sm font-semibold text-white">Sign in</Text>
            </Pressable>
          </Link>
        </View>
      }>
      <Card className="p-6">
        <Text className="text-xl font-bold text-content dark:text-white">Create account</Text>
        <Text className="mt-1 text-sm text-content-secondary dark:text-gray-400">
          Set up your account in seconds
        </Text>

        <View className="mt-6 gap-4">
          <FormField
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

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
                placeholder="Min. 8 characters"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
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

          {displayError ? (
            <Text className="text-sm text-expense-500">{displayError}</Text>
          ) : null}

          <PrimaryButton
            label="Sign up"
            onPress={handleRegister}
            loading={isLoading}
            disabled={!name.trim() || !email.trim() || !password}
            className="mt-2"
          />
        </View>
      </Card>
    </AuthShell>
  );
}
