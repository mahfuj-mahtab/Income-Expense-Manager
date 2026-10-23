import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/constants/theme';

export function IconButton({
  icon,
  onPress,
  size = 40,
  color = palette.primary,
  className = '',
  accessibilityLabel,
  haptic = true,
  surface = 'tint',
}) {
  const surfaces = {
    tint: 'bg-primary-50 active:bg-primary-100 dark:bg-primary-600/20',
    glass: 'bg-white/15 active:bg-white/25',
  };

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
      className={`items-center justify-center rounded-full ${surfaces[surface]} ${className}`}
      style={{ width: size, height: size }}>
      <IconSymbol name={icon} size={size * 0.45} color={color} />
    </Pressable>
  );
}
