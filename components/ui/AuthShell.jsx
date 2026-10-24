import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/theme';

export function AuthShell({ children, footer, tagline }) {
  return (
    <LinearGradient
      colors={palette.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="flex-1 justify-center px-6">
            <View className="absolute -right-16 top-8 h-40 w-40 rounded-full bg-white/10" />
            <View className="absolute -left-10 bottom-16 h-28 w-28 rounded-full bg-white/10" />

            <View className="mb-8">
              <Image
                source={require('../../assets/logo.png')}
                style={{ width: 88, height: 88 }}
                contentFit="contain"
              />
              <Text className="mt-4 text-3xl font-bold tracking-tight text-white">
                MyMoneyPlan
              </Text>
              <Text className="mt-2 text-base text-white/75">{tagline}</Text>
            </View>

            {children}
            {footer}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
