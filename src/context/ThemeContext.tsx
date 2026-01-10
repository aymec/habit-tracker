import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get stored theme mode (works on native and web)
const getStoredThemeMode = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // Use localStorage on web, but check if window is defined (SSR safety)
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('user-theme-mode');
    }
    return null;
  }
  // Use AsyncStorage on native
  return await AsyncStorage.getItem('user-theme-mode');
};

// Helper to set stored theme mode (works on native and web)
const setStoredThemeMode = async (mode: string): Promise<void> => {
  if (Platform.OS === 'web') {
    // Use localStorage on web, but check if window is defined (SSR safety)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user-theme-mode', mode);
    }
  } else {
    // Use AsyncStorage on native
    await AsyncStorage.setItem('user-theme-mode', mode);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await getStoredThemeMode();
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemeMode();
  }, []);

  // Custom setMode that persists to storage
  const setMode = async (newMode: ThemeMode) => {
    try {
      await setStoredThemeMode(newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Set system UI background color to match theme
    if (!isLoading) {
      SystemUI.setBackgroundColorAsync(theme.colors.background);
    }
  }, [theme, isLoading]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
