import { Tabs, useRouter, useSegments } from 'expo-router';
import { PixelRatio, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const segments = useSegments();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontScale = PixelRatio.getFontScale();
  const { width: windowWidth } = useWindowDimensions();

  // On web, when window is wide enough, labels appear next to icons - use larger font
  const TAB_LABEL_SIDE_BY_SIDE_THRESHOLD = 768;
  const isWebWideLabelLayout = Platform.OS === 'web' && windowWidth >= TAB_LABEL_SIDE_BY_SIDE_THRESHOLD;
  const tabBarFontSize = isWebWideLabelLayout ? 16 : 12;

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
          fontSize: tabBarFontSize,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.header,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 8, // Add shadow for Android
          minHeight: (Platform.OS === 'ios' ? 40 : 50) + 15 * fontScale + insets.bottom, // Scale gently with font size for accessibility
          paddingBottom: insets.bottom > 0 ? 20 + insets.bottom : 10, // Push content above nav bar
          paddingTop: 10,
          ...(Platform.OS === 'web' && {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
            minHeight: 60 + 15 * fontScale,
          }),
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
        name="(settings)"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
