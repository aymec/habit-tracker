# OnTrack - Habit Tracker App

## Overview
A cross-platform habit tracking app built with React Native and Expo. Users can create habits, set optional targets, log entries with customizable quick-add options, and view history.

**Platforms:** iOS, Android, Web

## Tech Stack
- **Expo SDK 54** with New Architecture (Hermes)
- **React 19** with React Compiler enabled
- **expo-router** - File-based navigation
- **TypeScript** - Strict mode
- **AsyncStorage** (native) / **localStorage** (web) - Data persistence
- **i18next** - Internationalization (12 languages)
- **react-native-safe-area-context** - Safe area handling
- **react-native-edge-to-edge** - Android edge-to-edge display

## Project Structure
```
app/                          # Expo Router screens
├── _layout.tsx               # Root: SafeAreaProvider → ThemeProvider → HabitProvider
└── (tabs)/                   # Bottom tab navigator
    ├── _layout.tsx           # Tab bar configuration
    ├── settings.tsx          # Settings screen
    └── (home)/               # Home stack navigator
        ├── index.tsx         # Habits list
        ├── goal.tsx          # Habit details & logging
        ├── edit.tsx          # Edit habit
        ├── history.tsx       # Entry history
        ├── name.tsx          # Create habit - step 1
        └── target.tsx        # Create habit - step 2

src/
├── context/
│   ├── HabitContext.tsx      # Habits state (CRUD operations)
│   └── ThemeContext.tsx      # Theme state (light/dark/system)
├── services/
│   └── storage.ts            # Platform-agnostic storage wrapper
├── models/
│   └── types.ts              # Habit, Option, Entry types
├── theme/
│   └── index.ts              # Theme colors & spacing
└── i18n/
    ├── index.ts              # i18next config with language detector
    └── locales/              # Translation JSON files

components/
├── haptic-tab.tsx            # Tab with iOS haptic feedback
└── ui/
    ├── icon-symbol.tsx       # Cross-platform icons (SF Symbols ↔ Material)
    └── icon-symbol.ios.tsx   # iOS-specific SF Symbols
```

## Key Patterns

### State Management
- **HabitContext**: All habit data - `useHabit()` hook provides habits, activeHabit, entries, options, and CRUD actions
- **ThemeContext**: Theme mode (light/dark/system) - `useTheme()` hook provides theme colors and isDark

### Data Types
```typescript
interface Habit {
  id: string;
  name: string;
  icon?: string;
  target?: { value: number; period: 'day' | 'week' | 'month' | 'year' };
  totalCount: number;
  createdAt: string;
}

interface Option {
  id: string;
  habitId: string;
  label: string;    // e.g., "Glass S", "🍎"
  value: number;    // Units added when logged
}

interface Entry {
  id: string;
  habitId: string;
  label: string;
  value: number;
  timestamp: string;
}
```

### Storage
- Platform detection: `Platform.OS === 'web'` uses localStorage, else AsyncStorage
- Keys: `'habits'`, `'options'`, `'entries'`, `'user-theme-mode'`, `'user-language'`
- Cascade deletion: Deleting habit removes its options and entries

## Platform-Specific Behaviors

### Android
- **Edge-to-edge enabled** (`app.json`): App draws behind system bars
- **react-native-edge-to-edge** package required for proper safe area insets
- **Tab bar** adapts to 3-button vs gesture navigation using `useSafeAreaInsets().bottom`
- **Tab bar height** scales with font size: `(Platform.OS === 'ios' ? 40 : 50) + 15 * fontScale + insets.bottom`
- **Dialogs**: Uses `Alert.alert()` with button array

### iOS
- **Haptic feedback** on tab press (expo-haptics)
- **SF Symbols** for native icons
- **Tab bar height**: `40 + 15 * fontScale + insets.bottom`
- **Dialogs**: Uses `Alert.alert()` with button array

### Web
- **Width constrained** to window height on landscape (prevents super-wide display)
- **localStorage** for persistence
- **window.confirm()** / **window.alert()** for dialogs
- SSR-safe: Checks `typeof window !== 'undefined'`

## Tab Bar Configuration
Located in `app/(tabs)/_layout.tsx`:
```typescript
tabBarStyle: {
  backgroundColor: theme.colors.header,
  borderTopColor: theme.colors.border,
  borderTopWidth: 1,
  elevation: 8,
  minHeight: (Platform.OS === 'ios' ? 40 : 50) + 15 * fontScale + insets.bottom,
  paddingBottom: insets.bottom > 0 ? 20 + insets.bottom : 10,
  paddingTop: 10,
}
```
- Uses `PixelRatio.getFontScale()` for accessibility scaling
- Uses `useSafeAreaInsets()` for Android navigation bar

## Internationalization
- 12 languages: en, es, fr, de, it, pt, nl, ru, ja, zh-CN, zh-TW, hi
- Auto-detects device language, falls back to English
- Language selection persisted to storage
- Access via `useTranslation()` hook

## Commands
```bash
npm run start       # Start Expo dev server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run web version
npm run deploy      # Build and deploy web to GitHub Pages
npm run lint        # ESLint
npm test            # Jest tests
```

### Web Deployment
The `scripts/fix-asset-paths.js` script runs during `npm run deploy` to fix asset paths for GitHub Pages compatibility. It renames `node_modules` to `vendor` and `@scoped` packages to `_at_scoped` to avoid issues with `.gitignore` and URL encoding.

### Native Rebuilds
Required when changing native config (app.json android/ios sections, native packages):
```bash
npx expo prebuild --platform android --clean && npx expo run:android
npx expo prebuild --platform ios --clean && npx expo run:ios
```

## Important Configuration

### app.json
- `android.edgeToEdgeEnabled: true` - Draws behind system bars
- `experiments.typedRoutes: true` - Type-safe routing
- `experiments.reactCompiler: true` - React 19 compiler
- `newArchEnabled: true` - New Architecture

### AndroidManifest.xml
- `android:launchMode="singleTask"` - Prevents multiple instances
- `android:configChanges` - Handles keyboard, orientation, screen size changes without restart

## Testing
- Jest + React Native Testing Library
- Tests in `__tests__/` folders adjacent to source files
- Mock AsyncStorage in tests
- Run: `npm test`
