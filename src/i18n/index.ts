import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import hi from './locales/hi.json';
import nl from './locales/nl.json';

const RESOURCES = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  hi: { translation: hi },
  nl: { translation: nl },
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

// Normalize OS language tags to our resource keys
// Handles: zh-Hans, zh-Hans-CN, zh-Hant, zh-Hant-TW, zh-CN, zh-TW, etc.
const SUPPORTED_LANGUAGES = Object.keys(RESOURCES);
const normalizeLanguage = (tag: string, languageCode: string | null): string | null => {
  if (SUPPORTED_LANGUAGES.includes(tag)) return tag;

  // Map script-based Chinese tags (iOS) to our region-based keys
  if (tag.startsWith('zh-Hans') || tag === 'zh-CN') return 'zh-CN';
  if (tag.startsWith('zh-Hant') || tag === 'zh-TW') return 'zh-TW';

  // Try base language code (e.g. "fr" from "fr-FR")
  if (languageCode && SUPPORTED_LANGUAGES.includes(languageCode)) return languageCode;

  return null;
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const locale = Localization.getLocales()[0];
      const tag = locale.languageTag || locale.languageCode || 'en';

      // On native, prefer the OS-level language (includes iOS per-app setting)
      if (Platform.OS !== 'web') {
        const osLang = normalizeLanguage(tag, locale.languageCode);
        if (osLang) {
          await setStoredLanguage(osLang);
          return callback(osLang);
        }
      }

      // Check stored language preference (primary method for web)
      const storedLanguage = await getStoredLanguage();
      if (storedLanguage) {
        return callback(storedLanguage);
      }

      // Fallback to normalized device language
      return callback(normalizeLanguage(tag, locale.languageCode) || 'en');
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

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: RESOURCES,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4', // Required for Android
  });

export default i18n;
