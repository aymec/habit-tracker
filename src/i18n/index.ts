import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

import en from './locales/en.json';
import es from './locales/es.json';

const RESOURCES = {
  en: { translation: en },
  es: { translation: es },
};

// Helper to get stored language (works on native and web)
const getStoredLanguage = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // Use localStorage on web, but check if window is defined (SSR safety)
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('user-language');
    }
    return null;
  }
  // Use AsyncStorage on native
  return await AsyncStorage.getItem('user-language');
};

// Helper to set stored language (works on native and web)
const setStoredLanguage = async (language: string): Promise<void> => {
  if (Platform.OS === 'web') {
    // Use localStorage on web, but check if window is defined (SSR safety)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user-language', language);
    }
  } else {
    // Use AsyncStorage on native
    await AsyncStorage.setItem('user-language', language);
  }
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // Check stored language preference first
      const storedLanguage = await getStoredLanguage();
      if (storedLanguage) {
        return callback(storedLanguage);
      }

      // Fallback to device language
      // expo-localization returns locales like "en-US", we just want "en"
      const deviceLanguage = Localization.getLocales()[0].languageCode;
      return callback(deviceLanguage || 'en');
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await setStoredLanguage(language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: RESOURCES,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3', // Required for Android
  });

export default i18n;
