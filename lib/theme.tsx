import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'settings.appearance';

const isWeb = Platform.OS === 'web';

const getStoredTheme = async (): Promise<AppTheme | null> => {
  if (isWeb) return localStorage.getItem(STORAGE_KEY) as AppTheme | null;
  const value = await SecureStore.getItemAsync(STORAGE_KEY);
  return value as AppTheme | null;
};

const setStoredTheme = async (theme: AppTheme) => {
  if (isWeb) {
    localStorage.setItem(STORAGE_KEY, theme);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, theme);
};

type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  isDark: true,
  setTheme: async () => {},
  toggleTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getStoredTheme().then((stored) => {
      if (stored) {
        setThemeState(stored);
      }
      setIsLoaded(true);
    });
  }, []);

  const setTheme = useCallback(async (newTheme: AppTheme) => {
    setThemeState(newTheme);
    await setStoredTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    await setTheme(next);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
