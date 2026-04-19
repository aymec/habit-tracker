import { useMemo } from 'react';
import { Platform, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const lightLifted: ViewStyle = {
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
    },
  }),
};

const lightPressed: ViewStyle = {
  transform: [{ translateX: 2 }, { translateY: 2 }],
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.15)',
    },
  }),
};

const darkLifted: ViewStyle = {
  ...Platform.select({
    ios: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    android: {
      boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.2)',
    },
    web: {
      boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.2)',
    },
  }),
};

const darkPressed: ViewStyle = {
  transform: [{ translateX: 2 }, { translateY: 2 }],
  ...Platform.select({
    ios: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      boxShadow: '0px 1px 5px rgba(255, 255, 255, 0.1)',
    },
    web: {
      boxShadow: '0px 1px 5px rgba(255, 255, 255, 0.1)',
    },
  }),
};

export function usePressEffect(): { liftedStyle: ViewStyle; pressedStyle: ViewStyle } {
  const { isDark } = useTheme();
  return useMemo(
    () =>
      isDark
        ? { liftedStyle: darkLifted, pressedStyle: darkPressed }
        : { liftedStyle: lightLifted, pressedStyle: lightPressed },
    [isDark]
  );
}
