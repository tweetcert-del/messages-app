import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type AppUpdatesSettings = {
  autoUpdate: boolean;
  notifyAvailable: boolean;
};

const STORAGE_KEY = 'settings.app_updates';

const DEFAULTS: AppUpdatesSettings = {
  autoUpdate: false,
  notifyAvailable: true,
};

export const getStoredAppUpdatesSettings = async (): Promise<AppUpdatesSettings> => {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULTS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    }

    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
};

export const setStoredAppUpdatesSettings = async (value: AppUpdatesSettings) => {
  const raw = JSON.stringify(value);
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, raw);
};
