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
