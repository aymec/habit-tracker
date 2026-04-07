# Liquid Glass UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add iOS 26 Liquid Glass support to OnTrack — native tab bar, native headers, and selective glass on habit cards and quick-add buttons, with full backward compatibility on older iOS, Android, and web.

**Architecture:** Replace JS-rendered tab bar with Expo Router's NativeTabs (UITabBarController on iOS). Replace custom home header with native stack header. Use `expo-glass-effect` GlassView on habit cards and option buttons, gated by `isLiquidGlassAvailable()`. Web gets platform-specific layout files preserving current behavior.

**Tech Stack:** Expo SDK 54, React Native 0.81, expo-router NativeTabs, expo-glass-effect, react-native-screens

---

## File Structure

### New files

| File | Responsibility |
|---|---|
| `app/(tabs)/_layout.web.tsx` | Web-specific tab bar preserving current JS-rendered layout |
| `app/(tabs)/(home)/_layout.web.tsx` | Web-specific home stack preserving custom header |
| `components/ui/glass-card.tsx` | Conditional wrapper: GlassView on iOS 26+, plain View elsewhere |

### Modified files

| File | Changes |
|---|---|
| `app/(tabs)/_layout.tsx` | Replace `<Tabs>` with `<NativeTabs>` |
| `app/(tabs)/(home)/_layout.tsx` | Drop custom header, use native header with logo |
| `app/(tabs)/(home)/index.tsx` | Wrap habit cards in `<GlassCard>` |
| `app/(tabs)/(home)/goal.tsx` | Wrap option buttons in `<GlassCard>` |
| `package.json` | Add `expo-glass-effect`, remove `@react-navigation/bottom-tabs` if unused elsewhere |

### Deleted files

| File | Reason |
|---|---|
| `components/haptic-tab.tsx` | Native tab bar provides haptics natively |
| `components/ui/TabBarBackground.tsx` | Native tab bar handles its own background |

---

## Task 1: Install expo-glass-effect

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

Run:
```bash
npx expo install expo-glass-effect
```
Expected: Package added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify installation**

Run:
```bash
grep "expo-glass-effect" package.json
```
Expected: A line showing `"expo-glass-effect"` with a version number.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add expo-glass-effect for Liquid Glass support"
```

---

## Task 2: Create the GlassCard wrapper component

**Files:**
- Create: `components/ui/glass-card.tsx`

- [ ] **Step 1: Create the GlassCard component**

Write `components/ui/glass-card.tsx`:

```tsx
import { View, ViewProps, StyleSheet } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

type GlassEffectStyle = 'regular' | 'clear';

interface GlassCardProps extends ViewProps {
  glassEffect?: GlassEffectStyle;
  fallbackBackgroundColor: string;
  fallbackBorderColor?: string;
  borderRadius?: number;
}

const glassAvailable = isLiquidGlassAvailable();

export function GlassCard({
  children,
  glassEffect = 'regular',
  fallbackBackgroundColor,
  fallbackBorderColor,
  borderRadius = 8,
  style,
  ...rest
}: GlassCardProps) {
  if (glassAvailable) {
    return (
      <GlassView
        glassEffectStyle={glassEffect}
        style={[{ borderRadius, overflow: 'hidden' }, style]}
        {...rest}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: fallbackBackgroundColor,
          borderColor: fallbackBorderColor,
          borderWidth: fallbackBorderColor ? 1 : 0,
          borderRadius,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/glass-card.tsx
git commit -m "Add GlassCard wrapper component for conditional Liquid Glass"
```

---

## Task 3: Create web-specific tab layout

This must be done **before** modifying the native tab layout, so web doesn't break.

**Files:**
- Create: `app/(tabs)/_layout.web.tsx`

- [ ] **Step 1: Create the web tab layout**

Write `app/(tabs)/_layout.web.tsx` — this is a copy of the current `_layout.tsx` with `HapticTab` removed (not relevant on web):

```tsx
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
```

- [ ] **Step 2: Verify web still works**

Run:
```bash
npx expo start --web
```
Expected: Web app loads with the same tab bar appearance as before.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/_layout.web.tsx
git commit -m "Add web-specific tab layout to preserve JS tab bar on web"
```

---

## Task 4: Create web-specific home stack layout

Must be done **before** modifying the native home stack layout.

**Files:**
- Create: `app/(tabs)/(home)/_layout.web.tsx`

- [ ] **Step 1: Create the web home layout**

Write `app/(tabs)/(home)/_layout.web.tsx` — this is the current `_layout.tsx` as-is (preserving the custom header on web):

```tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/context/ThemeContext';

const iconLight = require('../../../assets/images/icon-light-128x128.webp');
const iconDark = require('../../../assets/images/icon-dark-128x128.webp');

const HEADER_CONTENT_HEIGHT = 54;

function CustomHomeHeader() {
  const { isDark, theme } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const effectiveWidth = !mounted ? 0 : width;
  const effectiveInsetsTop = !mounted ? 0 : insets.top;

  const showAppName = effectiveWidth >= 500;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.header,
          paddingTop: effectiveInsetsTop,
          borderBottomColor: theme.colors.border,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image
            source={isDark ? iconLight : iconDark}
            style={styles.logoImage}
          />
          {showAppName && (
            <Text style={[styles.appName, { color: theme.colors.text }]}>OnTrack</Text>
          )}
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('habits.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>
    </View>
  );
}

export default function WebHomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          header: () => <CustomHomeHeader />,
        }}
      />
      <Stack.Screen name="goal" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="history" />
      <Stack.Screen name="name" />
      <Stack.Screen name="target" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    height: HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  appName: {
    fontSize: 19,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerRight: {
    minWidth: 60,
  },
});
```

- [ ] **Step 2: Verify web still works**

Run:
```bash
npx expo start --web
```
Expected: Web app loads with the same custom home header as before.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/_layout.web.tsx
git commit -m "Add web-specific home layout to preserve custom header on web"
```

---

## Task 5: Migrate tab bar to NativeTabs

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Rewrite the tab layout to use NativeTabs**

Replace the entire content of `app/(tabs)/_layout.tsx` with:

```tsx
import { NativeTabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>{t('habits.title')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>{t('settings.title')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors. If NativeTabs types are not found, check that `expo-router` version `~6.0.21` exports NativeTabs. If not, consult the [Expo Router Native Tabs docs](https://docs.expo.dev/router/advanced/native-tabs/).

- [ ] **Step 3: Test on iOS simulator**

Run:
```bash
npx expo prebuild --platform ios --clean && npx expo run:ios
```
Expected: App launches with a native iOS tab bar. On iOS 26 simulator (Xcode 26), the tab bar shows Liquid Glass effect. On older iOS, a standard tab bar.

- [ ] **Step 4: Test on Android emulator**

Run:
```bash
npx expo run:android
```
Expected: App launches with Material 3 bottom navigation.

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "Migrate tab bar to NativeTabs for Liquid Glass support"
```

---

## Task 6: Switch home header to native

**Files:**
- Modify: `app/(tabs)/(home)/_layout.tsx`

- [ ] **Step 1: Rewrite the home stack layout with native header**

Replace the entire content of `app/(tabs)/(home)/_layout.tsx` with:

```tsx
import { Stack } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/context/ThemeContext';

const iconLight = require('../../../assets/images/icon-light-128x128.webp');
const iconDark = require('../../../assets/images/icon-dark-128x128.webp');

export default function HomeStackLayout() {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: t('habits.title'),
          headerLeft: () => (
            <Image
              source={isDark ? iconLight : iconDark}
              style={styles.logoImage}
            />
          ),
        }}
      />
      <Stack.Screen name="goal" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="history" />
      <Stack.Screen name="name" />
      <Stack.Screen name="target" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
  },
});
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Test on iOS simulator**

Run:
```bash
npx expo run:ios
```
Expected: Home screen shows native header with logo on left, centered "Habits" title. On iOS 26, header has Liquid Glass effect.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/\(home\)/_layout.tsx
git commit -m "Replace custom home header with native header for Liquid Glass"
```

---

## Task 7: Add GlassCard to habit cards on home screen

**Files:**
- Modify: `app/(tabs)/(home)/index.tsx`

- [ ] **Step 1: Import GlassCard and update the habit card rendering**

In `app/(tabs)/(home)/index.tsx`, add the import at the top:

```tsx
import { GlassCard } from '../../../components/ui/glass-card';
```

Then replace the `renderItem` callback in the `FlatList`. Find:

```tsx
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.goalItem,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.m
                }
              ]}
              onPress={() => handleGoalPress(item.id)}
            >
              <Text style={[styles.goalName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
```

Replace with:

```tsx
          renderItem={({ item }) => (
            <GlassCard
              fallbackBackgroundColor={theme.colors.card}
              fallbackBorderColor={theme.colors.border}
              borderRadius={theme.borderRadius.m}
              style={styles.goalItemOuter}
            >
              <TouchableOpacity
                style={styles.goalItem}
                onPress={() => handleGoalPress(item.id)}
              >
                <Text style={[styles.goalName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </GlassCard>
          )}
```

Then update the styles. Find:

```tsx
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
```

Replace with:

```tsx
  goalItemOuter: {
    marginBottom: 10,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Test on iOS simulator**

Run:
```bash
npx expo run:ios
```
Expected: Habit cards show Liquid Glass effect on iOS 26, opaque cards with border on older iOS. Cards are still tappable and navigate to the goal screen.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/\(home\)/index.tsx
git commit -m "Wrap habit cards in GlassCard for Liquid Glass effect"
```

---

## Task 8: Add GlassCard to option buttons on goal screen

**Files:**
- Modify: `app/(tabs)/(home)/goal.tsx`

- [ ] **Step 1: Import GlassCard and update the option button rendering**

In `app/(tabs)/(home)/goal.tsx`, add the import at the top:

```tsx
import { GlassCard } from '../../../components/ui/glass-card';
```

Then replace the option button mapping. Find:

```tsx
          {activeHabitOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => logEntry(activeHabit.id, option.label, option.value)}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionValue, { color: theme.colors.text }]}>
                {formatNumberWithSign(option.value)}
              </Text>
            </TouchableOpacity>
          ))}
```

Replace with:

```tsx
          {activeHabitOptions.map((option) => (
            <GlassCard
              key={option.id}
              glassEffect="clear"
              fallbackBackgroundColor={theme.colors.card}
              fallbackBorderColor={theme.colors.border}
              borderRadius={16}
              style={styles.optionButtonOuter}
            >
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => logEntry(activeHabit.id, option.label, option.value)}
              >
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionValue, { color: theme.colors.text }]}>
                  {formatNumberWithSign(option.value)}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          ))}
```

Then update the styles. Find:

```tsx
  optionButton: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
```

Replace with:

```tsx
  optionButtonOuter: {
    width: 100,
    height: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  optionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Test on iOS simulator**

Run:
```bash
npx expo run:ios
```
Expected: Quick-add option buttons show a lighter "clear" glass effect on iOS 26. Buttons are tappable and log entries correctly. On older iOS, they appear as opaque cards with borders as before.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/\(home\)/goal.tsx
git commit -m "Wrap option buttons in GlassCard for Liquid Glass effect"
```

---

## Task 9: Delete unused components

**Files:**
- Delete: `components/haptic-tab.tsx`
- Delete: `components/ui/TabBarBackground.tsx`

- [ ] **Step 1: Verify no other files import these components**

Run:
```bash
grep -r "haptic-tab\|HapticTab" app/ components/ src/ --include="*.tsx" --include="*.ts" -l
grep -r "TabBarBackground" app/ components/ src/ --include="*.tsx" --include="*.ts" -l
```

Expected for `HapticTab`: Only `app/(tabs)/_layout.web.tsx` should reference it. If so, also remove it from the web layout (it was a `PlatformPressable` wrapper for iOS haptics, irrelevant on web).

Expected for `TabBarBackground`: Only `app/(tabs)/_layout.web.tsx` should reference it. If so, remove the import and the `tabBarBackground` prop from the web layout too.

- [ ] **Step 2: Clean up web layout imports if needed**

In `app/(tabs)/_layout.web.tsx`, remove these lines if present:

```tsx
import { HapticTab } from '@/components/haptic-tab';
import TabBarBackground from '@/components/ui/TabBarBackground';
```

And remove from `screenOptions` if present:

```tsx
tabBarButton: HapticTab,
tabBarBackground: TabBarBackground,
```

- [ ] **Step 3: Delete the files**

Run:
```bash
rm components/haptic-tab.tsx components/ui/TabBarBackground.tsx
```

- [ ] **Step 4: Verify it compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors, no missing import errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove HapticTab and TabBarBackground (replaced by NativeTabs)"
```

---

## Task 10: Full platform verification

- [ ] **Step 1: iOS 26 verification (Xcode 26)**

Run:
```bash
npx expo prebuild --platform ios --clean && npx expo run:ios
```

Verify:
- Tab bar has Liquid Glass effect
- Home screen header has Liquid Glass effect with logo on left
- Sub-screen headers (goal, edit, history, settings, privacy) have Liquid Glass effect
- Habit cards on home screen show glass material
- Option buttons on goal screen show glass material (lighter "clear" effect)
- Dark mode: all glass elements adapt correctly
- Tab switching works, navigation works, logging entries works

- [ ] **Step 2: Older iOS verification (iOS 18 simulator)**

Switch to an iOS 18 simulator and run:
```bash
npx expo run:ios --device "iPhone 15"
```

Verify:
- Tab bar is traditional iOS style (no glass)
- Headers are standard translucent style
- Habit cards are opaque with borders (current look)
- Option buttons are opaque with borders and shadows
- All navigation and functionality works

- [ ] **Step 3: Android verification**

Run:
```bash
npx expo run:android
```

Verify:
- Tab bar is Material 3 bottom navigation
- Headers render correctly
- Habit cards and option buttons are opaque (current look)
- All navigation and functionality works

- [ ] **Step 4: Web verification**

Run:
```bash
npx expo start --web
```

Verify:
- Tab bar has rounded corners and custom styling (current look)
- Home screen has custom header with logo, centered title, "OnTrack" label on wide screens
- All screens render and navigate correctly
- Dark mode works

- [ ] **Step 5: Accessibility verification**

On iOS 26 simulator:
- Enable VoiceOver, verify tab bar items are announced correctly
- Increase font size in Settings > Accessibility, verify tab labels scale
- Verify habit cards and option buttons are accessible via VoiceOver
