import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function SettingsStackLayout() {
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
      <Stack.Screen name="index" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
