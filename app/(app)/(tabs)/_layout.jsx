import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function TabIcon({ name, color, focused, isDark }) {
  return (
    <View
      style={{
        backgroundColor: focused
          ? isDark
            ? 'rgba(232, 240, 248, 0.12)'
            : palette.primaryLight
          : 'transparent',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 4,
      }}>
      <IconSymbol size={22} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? palette.primaryLight : palette.primary,
        tabBarInactiveTintColor: isDark ? palette.darkTextSecondary : palette.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? palette.darkCard : palette.card,
          borderTopColor: isDark ? palette.darkBorder : palette.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          ...Platform.select({
            ios: {
              shadowColor: palette.primaryDeep,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
            },
            android: {
              elevation: 10,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="creditcard.fill" color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="list.bullet" color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: 'Debts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="banknote.fill" color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="gearshape.fill" color={color} focused={focused} isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  );
}
