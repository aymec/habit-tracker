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
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0px 3px 8px rgba(255, 255, 255, 0.15)',
    },
  }),
};

const darkPressed: ViewStyle = {
  transform: [{ translateX: 2 }, { translateY: 2 }],
  ...Platform.select({
    ios: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: '0px 1px 4px rgba(255, 255, 255, 0.08)',
    },
  }),
};

export function usePressEffect(): { liftedStyle: ViewStyle; pressedStyle: ViewStyle } {
  const { isDark } = useTheme();
  return isDark
    ? { liftedStyle: darkLifted, pressedStyle: darkPressed }
    : { liftedStyle: lightLifted, pressedStyle: lightPressed };
}
