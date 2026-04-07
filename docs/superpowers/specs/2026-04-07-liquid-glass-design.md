# Liquid Glass UI — Design Spec

## Overview

Add iOS 26 Liquid Glass support to OnTrack. The goal is native system bar integration (tab bar + navigation headers) plus selective glass treatment on key custom UI surfaces (habit cards, quick-add buttons). All changes gracefully fall back on older iOS, Android, and web — no platform loses functionality.

## Current State

| Component | Current Implementation | Liquid Glass Ready? |
|---|---|---|
| Tab bar | JS-rendered `<Tabs>` with custom `tabBarStyle` | No |
| Home header | Custom JS `<CustomHomeHeader />` (View) | No |
| Stack headers (goal, edit, history, settings, privacy) | Native `<Stack.Screen>` via react-native-screens | Yes (automatic with Xcode 26) |
| Habit cards | Opaque `View` with theme `card` color | No |
| Quick-add buttons | Opaque styled buttons | No |
| Web tab bar | JS-rendered with rounded corners | N/A (no Liquid Glass on web) |

## Version Requirements

### Already compatible (no changes needed)

- **Expo SDK 54** (`~54.0.31`) — supports NativeTabs, expo-glass-effect, iOS 26
- **React Native 0.81.5** — meets the RN 0.80+ requirement for Liquid Glass
- **React 19.1.0** — compatible
- **react-native-screens ~4.16.0** — native stack headers get Liquid Glass automatically
- **react-native-reanimated ~4.1.1** — compatible

### New packages to install

- `expo-glass-effect` — provides `GlassView`, `GlassContainer`, `isLiquidGlassAvailable()`

### Build tooling

- **Xcode 26** required to build iOS for Liquid Glass to appear
- Native rebuild: `npx expo prebuild --platform ios --clean && npx expo run:ios`

### Packages to remove

- `@react-navigation/bottom-tabs` — replaced by NativeTabs (used implicitly via expo-router `<Tabs>`)
- `components/haptic-tab.tsx` — native tab bar provides haptics natively
- `components/ui/TabBarBackground.tsx` — native tab bar handles its own background

---

## Change 1: Tab Bar — Migrate to NativeTabs

### What

Replace the JS-rendered `<Tabs>` in `app/(tabs)/_layout.tsx` with Expo Router's `<NativeTabs>`.

### Why

NativeTabs renders `UITabBarController` on iOS, which gets Liquid Glass automatically on iOS 26. The current JS tab bar will never get Liquid Glass — it's a plain `View`.

### Implementation

**`app/(tabs)/_layout.tsx`** (iOS + Android):

- Replace `<Tabs>` with `<NativeTabs>` from `expo-router`
- Replace `<Tabs.Screen name="(home)">` with `<NativeTabs.Trigger name="(home)">` containing:
  - `<NativeTabs.Trigger.Icon sf="house.fill" md="home" />`
  - `<NativeTabs.Trigger.Label>{t('habits.title')}</NativeTabs.Trigger.Label>`
- Replace `<Tabs.Screen name="(settings)">` with `<NativeTabs.Trigger name="(settings)">` containing:
  - `<NativeTabs.Trigger.Icon sf="gear" md="settings" />`
  - `<NativeTabs.Trigger.Label>{t('settings.title')}</NativeTabs.Trigger.Label>`
- Remove all custom `tabBarStyle`, `tabBarBackground`, `tabBarButton`, `tabBarActiveTintColor` props
- Remove the `tabPress` listener logic — native tabs handle pop-to-root natively

**`app/(tabs)/_layout.web.tsx`** (Web fallback):

- Create a new web-specific layout that preserves the current JS-rendered tab bar
- Keep the existing `tabBarStyle` with rounded corners, font scaling, and inset handling
- Remove `HapticTab` (not relevant on web)
- This ensures web continues to work identically to today

### Removals

- `components/haptic-tab.tsx` — delete file
- `components/ui/TabBarBackground.tsx` — delete file
- Remove imports of these components from tab layout

### Platform behavior

| Platform | Result |
|---|---|
| iOS 26+ | Liquid Glass tab bar |
| iOS < 26 | Traditional iOS tab bar |
| Android | Material 3 bottom navigation |
| Web | Current JS tab bar (via `_layout.web.tsx`) |

---

## Change 2: Home Header — Switch to Native Header

### What

Replace the custom `CustomHomeHeader` component in `app/(tabs)/(home)/_layout.tsx` with a native stack header.

### Why

Custom JS headers don't get Liquid Glass. Native stack headers (via react-native-screens) get it automatically when built with Xcode 26.

### Implementation

**`app/(tabs)/(home)/_layout.tsx`** (iOS + Android):

- Remove the `CustomHomeHeader` component and its styles
- For the `index` screen, replace `header: () => <CustomHomeHeader />` with:
  - `title: t('habits.title')`
  - `headerLeft: () => <Image source={isDark ? iconLight : iconDark} style={{ width: 28, height: 28, borderRadius: 14, marginLeft: 8 }} />`
- Remove the `HEADER_CONTENT_HEIGHT` constant
- Keep `headerBackButtonDisplayMode: 'minimal'` for sub-screens

**`app/(tabs)/(home)/_layout.web.tsx`** (Web fallback):

- Create a web-specific layout that preserves the current custom header with its logo, centered title, app name display, and rounded corners
- This keeps the web experience unchanged

### What's preserved

- Logo in header (via `headerLeft`)
- Centered title (native default)
- Back button behavior on sub-screens

### What changes

- The "OnTrack" app name label (shown on wide web screens) moves to the web-only layout
- Header background becomes Liquid Glass on iOS 26 instead of opaque `theme.colors.header`

---

## Change 3: Selective Glass on Custom UI Elements

### What

Apply `GlassView` from `expo-glass-effect` to habit cards on the home list and quick-add option buttons on the goal screen.

### Why

System bars alone give a partial Liquid Glass feel. Applying glass to the primary interactive surfaces creates a cohesive iOS 26 aesthetic without overdoing it.

### Implementation

**Habit cards (home list):**

- Wrap each habit card in a `GlassView` when `isLiquidGlassAvailable()` returns true
- When glass is active: set card background to transparent so the glass material shows through
- When glass is not available: render the current opaque card with `theme.colors.card` background
- Use `glassEffectStyle="regular"` for the standard translucent look

**Quick-add option buttons (goal screen):**

- Wrap each option button in a `GlassView` when available
- Same conditional pattern: transparent background when glass is active, opaque fallback otherwise
- Use `glassEffectStyle="clear"` for a lighter effect on smaller elements

**Utility wrapper (optional):**

Consider a thin `<GlassCard>` wrapper component in `components/ui/` that encapsulates the `isLiquidGlassAvailable()` check and renders either `GlassView` or a plain `View` with the theme card color. This avoids repeating the conditional logic in every screen.

### Surfaces NOT getting glass

- Form inputs (edit, name, target screens) — utilitarian, glass adds noise
- Settings list items — standard grouped list, native feel is better
- Full-screen backgrounds — Apple recommends using glass sparingly

---

## Change 4: Theme Adjustments

### What

Adapt the theme system to account for Liquid Glass transparency.

### Why

When glass is active, opaque backgrounds fight the translucent material. The theme needs to yield to the native glass appearance on iOS 26.

### Implementation

**No changes to `src/theme/index.ts`:**

- `lightTheme` and `darkTheme` remain as-is — they are the fallback for all non-glass platforms
- The `header` and `tabBar` colors become irrelevant on iOS 26 (native bars manage their own appearance) but stay for web and older platforms

**Conditional transparency at usage sites:**

- Where `GlassView` is used, set `backgroundColor: 'transparent'` on the inner content
- This is handled per-component using the `isLiquidGlassAvailable()` check, not in the theme definition
- Keeps the theme simple and avoids platform-specific branching in the theme object

---

## File Changes Summary

### New files

| File | Purpose |
|---|---|
| `app/(tabs)/_layout.web.tsx` | Web-specific tab bar preserving current JS layout |
| `app/(tabs)/(home)/_layout.web.tsx` | Web-specific home layout preserving custom header |
| `components/ui/glass-card.tsx` | Optional wrapper for conditional GlassView/View rendering |

### Modified files

| File | Changes |
|---|---|
| `app/(tabs)/_layout.tsx` | Replace `<Tabs>` with `<NativeTabs>` |
| `app/(tabs)/(home)/_layout.tsx` | Drop custom header, use native header with `headerLeft` logo |
| `app/(tabs)/(home)/index.tsx` | Wrap habit cards in GlassView |
| `app/(tabs)/(home)/goal.tsx` | Wrap quick-add buttons in GlassView |
| `package.json` | Add `expo-glass-effect` |

### Deleted files

| File | Reason |
|---|---|
| `components/haptic-tab.tsx` | Native tab bar provides haptics |
| `components/ui/TabBarBackground.tsx` | Native tab bar handles background |

---

## Backward Compatibility

| Platform | Tab bar | Headers | Cards & buttons |
|---|---|---|---|
| **iOS 26+** | Liquid Glass (native) | Liquid Glass (native) | GlassView |
| **iOS < 26** | Traditional iOS tab bar | Standard translucent bar | Opaque fallback (current look) |
| **Android** | Material 3 bottom nav | Standard Material header | Opaque fallback (current look) |
| **Web** | Current JS tab bar (unchanged) | Current custom/native header (unchanged) | Opaque fallback (current look) |

No platform loses functionality. The worst case on any platform is "looks exactly like it does today."

---

## Testing Plan

1. **iOS 26 simulator (Xcode 26):** Verify Liquid Glass on tab bar, all navigation headers, habit cards, and quick-add buttons
2. **iOS 18 simulator:** Verify traditional tab bar, standard headers, opaque cards — no visual regression
3. **Android emulator:** Verify Material 3 tab bar, standard headers, opaque cards
4. **Web (`npm run web`):** Verify web-specific layouts render correctly with current styling
5. **Accessibility:** Verify native tab bar scales with font size, VoiceOver reads tabs correctly
6. **Dark mode:** Verify glass adapts correctly in both light and dark themes on iOS 26

---

## Sources

- [Expo GlassEffect docs](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
- [Expo Router Native Tabs](https://docs.expo.dev/router/advanced/native-tabs/)
- [Callstack Liquid Glass in React Native](https://www.callstack.com/blog/how-to-use-liquid-glass-in-react-native)
- [React Navigation Native Bottom Tab Navigator](https://reactnavigation.org/docs/native-bottom-tab-navigator/)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
