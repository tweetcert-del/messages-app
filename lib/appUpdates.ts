import * as Application from 'expo-application';
import * as BackgroundFetch from 'expo-background-fetch';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { getStoredAppUpdatesSettings } from './appUpdatesSettings';

const TASK_NAME = 'app-updates.check';
const LAST_CHECK_KEY = 'app_updates.last_check_day';
const LAST_NOTIFIED_VERSION_KEY = 'app_updates.last_notified_version';

type LatestInfo = {
  version: string;
  downloadUrl: string;
};

const getBaseUrl = () => {
  const raw = process.env.EXPO_PUBLIC_MESSAGES_BASE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
};

const semverCmp = (a: string, b: string) => {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10));
  const pb = b.split('.').map((n) => Number.parseInt(n, 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = Number.isFinite(pa[i]) ? pa[i] : 0;
    const nb = Number.isFinite(pb[i]) ? pb[i] : 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

const isNewer = (current: string, latest: string) => semverCmp(latest, current) > 0;

const getTodayKey = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const inNightWindow = () => {
  const h = new Date().getHours();
  return h >= 1 && h <= 6;
};

const getCurrentVersion = () => {
  const v = Application.nativeApplicationVersion;
  return typeof v === 'string' && v.length > 0 ? v : '0.0.0';
};

const fetchLatest = async (platform: 'android' | 'ios'): Promise<LatestInfo | null> => {
  const base = getBaseUrl();
  if (!base) return null;

  const res = await fetch(`${base}/api/app-updates/latest?platform=${platform}`);
  if (!res.ok) return null;
  const data = (await res.json()) as any;
  if (!data?.version || !data?.downloadUrl) return null;
  return { version: String(data.version), downloadUrl: String(data.downloadUrl) };
};

const scheduleUpdateNotification = async (title: string, body: string, url: string) => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('updates', {
      name: 'Updates',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { url },
    },
    trigger: null,
  });
};

const attemptAndroidInstall = async (url: string, version: string) => {
  const fileName = `messages-app-${version}.apk`;
  const dest = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ''}${fileName}`;
  if (!dest) return false;

  const download = await FileSystem.downloadAsync(url, dest);
  const contentUri = await FileSystem.getContentUriAsync(download.uri);

  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive',
  });

  return true;
};

export const configureAppUpdatesNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }),
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    const url = (response?.notification?.request?.content?.data as any)?.url;
    if (typeof url === 'string' && url.length > 0) {
      void Linking.openURL(url);
    }
  });
};

export const ensureAppUpdatesTaskAsync = async () => {
  const settings = await getStoredAppUpdatesSettings();
  const shouldRun = settings.autoUpdate || settings.notifyAvailable;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!shouldRun) {
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
    }
    return;
  }

  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
};

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const settings = await getStoredAppUpdatesSettings();
    if (!settings.autoUpdate && !settings.notifyAvailable) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    if (!inNightWindow()) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const today = getTodayKey();
    const last = await SecureStore.getItemAsync(LAST_CHECK_KEY);
    if (last === today) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const platform = Platform.OS === 'android' ? 'android' : 'ios';
    const latest = await fetchLatest(platform);
    if (!latest) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const current = getCurrentVersion();
    if (!isNewer(current, latest.version)) {
      await SecureStore.setItemAsync(LAST_CHECK_KEY, today);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const base = getBaseUrl();
    const absoluteDownloadUrl = base ? `${base}${latest.downloadUrl}` : latest.downloadUrl;

    if (settings.autoUpdate) {
      if (Platform.OS === 'android') {
        try {
          const ok = await attemptAndroidInstall(absoluteDownloadUrl, latest.version);
          await SecureStore.setItemAsync(LAST_CHECK_KEY, today);
          return ok
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.NoData;
        } catch {
          await scheduleUpdateNotification(
            'Actualización disponible',
            `Hay una nueva versión (${latest.version}). Toca para descargar.`,
            absoluteDownloadUrl
          );
          await SecureStore.setItemAsync(LAST_CHECK_KEY, today);
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }
      }

      await scheduleUpdateNotification(
        'Actualización disponible',
        `Hay una nueva versión (${latest.version}). Toca para descargar.`,
        absoluteDownloadUrl
      );
      await SecureStore.setItemAsync(LAST_CHECK_KEY, today);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    if (!settings.notifyAvailable) {
      await SecureStore.setItemAsync(LAST_CHECK_KEY, today);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const lastNotified = await SecureStore.getItemAsync(LAST_NOTIFIED_VERSION_KEY);
    if (lastNotified === latest.version) {
      await SecureStore.setItemAsync(LAST_CHECK_KEY, today);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await scheduleUpdateNotification(
      'Actualización disponible',
      `Hay una nueva versión (${latest.version}). Toca para descargar.`,
      absoluteDownloadUrl
    );

    await SecureStore.setItemAsync(LAST_NOTIFIED_VERSION_KEY, latest.version);
    await SecureStore.setItemAsync(LAST_CHECK_KEY, today);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
