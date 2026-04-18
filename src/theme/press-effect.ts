import { Platform } from 'react-native';

export const liftedStyle = {
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

export const pressedStyle = {
  transform: [{ translateX: 2 }, { translateY: 2 }],
  ...Platform.select({
    ios: {
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
