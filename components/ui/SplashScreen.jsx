import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BrandMark } from '@/components/ui/BrandMark';

export function LaunchSplash({ fontsReady, onLayout }) {
  const logoScale = useSharedValue(0.86);
  const logoOpacity = useSharedValue(0);
  const bar = useSharedValue(0.35);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
    bar.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [bar, logoOpacity, logoScale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + bar.value * 0.55,
    transform: [{ scaleX: bar.value }],
  }));

  const titleFont = fontsReady ? 'Inter_700Bold' : undefined;
  const bodyFont = fontsReady ? 'Inter_500Medium' : undefined;

  return (
    <LinearGradient
      colors={['#071E33', '#0E4C73', '#0F766E']}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(56, 189, 248, 0.16)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -90,
          left: -70,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
        }}
      />

      <View className="flex-1 items-center justify-center px-8" onLayout={onLayout}>
        <Animated.View style={[{ alignItems: 'center' }, logoStyle]}>
          <BrandMark size={132} />
          <Text
            style={{
              marginTop: 28,
              color: '#FFFFFF',
              fontSize: 32,
              letterSpacing: -0.6,
              fontFamily: titleFont,
            }}>
            Money Plan
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: 'rgba(255,255,255,0.72)',
              fontSize: 15,
              letterSpacing: 1.6,
              fontFamily: bodyFont,
            }}>
            Track · Plan · Grow
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 72,
              width: 112,
              height: 4,
              borderRadius: 999,
              overflow: 'hidden',
            },
            barStyle,
          ]}>
          <LinearGradient
            colors={['#38BDF8', '#34D399']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
