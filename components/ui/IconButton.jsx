import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function IconButton({
  icon,
  onPress,
  size = 40,
  color = '#133458',
  className = '',
  accessibilityLabel,
  haptic = true,
}) {
  return (
    <Pressable
      onPress={() => {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      className={`items-center justify-center rounded-full bg-primary-50 active:bg-primary-100 dark:bg-primary-600/20 ${className}`}
      style={{ width: size, height: size }}>
      <IconSymbol name={icon} size={size * 0.45} color={color} />
    </Pressable>
  );
}
