import Animated, { FadeInDown } from 'react-native-reanimated';

export function ScreenEnter({ children, fill = false }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      style={fill ? { flex: 1 } : { width: '100%' }}>
      {children}
    </Animated.View>
  );
}
