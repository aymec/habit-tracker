import { Tabs, useRouter, useSegments } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { PixelRatio } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';

const liquidGlass = isLiquidGlassAvailable();

function LiquidGlassTabs() {
  const { t } = useTranslation();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Icon sf="house.fill" />
        <Label>{t('habits.title')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <Icon sf="gear" />
        <Label>{t('settings.title')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabs() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const segments = useSegments();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontScale = PixelRatio.getFontScale();

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
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.header,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          minHeight: 40 + 15 * fontScale + insets.bottom,
          paddingBottom: insets.bottom > 0 ? 20 + insets.bottom : 10,
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

export default function TabLayout() {
  return liquidGlass ? <LiquidGlassTabs /> : <ClassicTabs />;
}
