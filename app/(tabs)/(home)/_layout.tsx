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
          headerTitleAlign: 'center',
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
    width: 34,
    height: 34,
    borderRadius: 17,
  },
});
