import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import CustomDrawerContent from '../../src/components/CustomDrawerContent';

export default function DrawerLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.colors.background,
            width: '80%',
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.text,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: t('habits.title'),
            title: t('habits.title'),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
