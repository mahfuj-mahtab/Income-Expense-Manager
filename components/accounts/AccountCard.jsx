import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/constants/theme';
import { formatCurrency } from '@/lib/accounts/formatCurrency';

export function AccountCard({
  name,
  currency,
  balance,
  onPress,
  onEdit,
  onDelete,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatCurrency(balance, currency)}`}
      className="active:scale-[0.98]">
      <LinearGradient
        colors={palette.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden rounded-sheet shadow-elevated">
        <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
        <View className="p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Text className="text-base font-bold text-white">{currency.slice(0, 1)}</Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold text-white" numberOfLines={1}>
                {name}
              </Text>
              <Text className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-white/70">
                {currency}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color="rgba(255,255,255,0.7)" />
          </View>

          <View className="mt-5 flex-row items-end justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Balance
              </Text>
              <Text
                className="mt-0.5 text-2xl font-bold text-white"
                numberOfLines={1}
                style={{ fontVariant: ['tabular-nums'] }}>
                {formatCurrency(balance, currency)}
              </Text>
            </View>
            <View className="flex-row gap-1">
              <IconButton
                icon="pencil"
                onPress={onEdit}
                accessibilityLabel="Edit account"
                size={36}
                color="#FFFFFF"
                surface="glass"
              />
              <IconButton
                icon="trash"
                onPress={onDelete}
                accessibilityLabel="Delete account"
                size={36}
                color="#FECACA"
                surface="glass"
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
