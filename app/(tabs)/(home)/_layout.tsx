import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="goal" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
