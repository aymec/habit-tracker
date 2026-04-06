import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { PixelRatio, useWindowDimensions } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

export default function WebTabLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const segments = useSegments();
  const router = useRouter();
  const fontScale = PixelRatio.getFontScale();
  const { width: windowWidth } = useWindowDimensions();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const effectiveWidth = !mounted ? 0 : windowWidth;
  const effectiveFontScale = !mounted ? 1 : fontScale;

  const TAB_LABEL_SIDE_BY_SIDE_THRESHOLD = 768;
  const isWebWideLabelLayout = effectiveWidth >= TAB_LABEL_SIDE_BY_SIDE_THRESHOLD;
  const tabBarFontSize = isWebWideLabelLayout ? 16 : 12;

  const isInHomeTab = segments[1] === '(home)';
  const currentScreen = segments[2] as string | undefined;
  const isAtHomeRoot = isInHomeTab && (segments.length === 2 || currentScreen === 'index');
  const isOnNestedHomeScreen = isInHomeTab && segments.length > 2 && currentScreen !== 'index';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarAllowFontScaling: true,
        tabBarLabelStyle: {
          fontSize: tabBarFontSize,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.header,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden' as const,
          minHeight: 60 + 15 * effectiveFontScale,
          paddingBottom: 10,
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
              e.preventDefault();
            } else if (isOnNestedHomeScreen) {
              e.preventDefault();
              router.dismissAll();
            }
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
