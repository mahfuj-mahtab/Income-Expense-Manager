import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

export function Fab({ onPress, label, accessibilityLabel = 'Add' }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="absolute bottom-6 right-6 flex-row items-center gap-2 rounded-full bg-primary px-5 py-4 shadow-glow active:bg-primary-600">
      <IconSymbol name="plus" size={22} color="#FFFFFF" />
      {label ? <Text className="text-base font-semibold text-white">{label}</Text> : null}
    </Pressable>
  );
}
