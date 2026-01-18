import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform, View, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HabitProvider } from '../src/context/HabitContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../src/context/ThemeContext';
import '../src/i18n';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isDark, theme } = useTheme();
  const { height } = useWindowDimensions();

  const content = (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );

  // On web, constrain width to not exceed window height
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.webContent, { maxWidth: height }]}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
  },
  webContent: {
    flex: 1,
    width: '100%',
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <HabitProvider>
          <RootNavigator />
        </HabitProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
