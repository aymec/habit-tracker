import { Tabs, useSegments, useRouter } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const segments = useSegments();
  const router = useRouter();

  // Check if we're in the home tab and where exactly
  const isInHomeTab = segments[1] === '(home)';
  const currentScreen = segments[2] as string | undefined;
  const isAtHomeRoot = isInHomeTab && (segments.length === 2 || currentScreen === 'index');
  const isOnNestedHomeScreen = isInHomeTab && segments.length > 2 && currentScreen !== 'index';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarAllowFontScaling: true,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.header,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 8, // Add shadow for Android
          minHeight: 90, // Ensure enough height, allows expansion for large fonts
          paddingBottom: 10, // Padding at bottom
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('habits.title'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (isAtHomeRoot) {
              // Already at home root, do nothing
              e.preventDefault();
            } else if (isOnNestedHomeScreen) {
              // On a nested screen (goal, edit, history), dismiss all and go to home
              e.preventDefault();
              router.dismissAll();
            }
            // If coming from settings tab, let default behavior handle it
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
