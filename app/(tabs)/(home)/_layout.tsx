import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HomeStackLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        ...(Platform.OS === 'web' && {
          headerStyle: {
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          },
        }),
      }}>
      <Stack.Screen name="index" options={{ title: t('habits.title'), headerTitleAlign: 'center' }} />
      <Stack.Screen name="goal" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
