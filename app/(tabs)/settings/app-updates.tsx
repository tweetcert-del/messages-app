import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, Switch, Text, View } from 'react-native';
import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import { useI18n } from '@/lib/i18n';
import { AppUpdatesSettings, getStoredAppUpdatesSettings, setStoredAppUpdatesSettings } from '@/lib/appUpdatesSettings';
import { ensureAppUpdatesTaskAsync } from '@/lib/appUpdates';

const Row = ({
  title,
  subtitle,
  value,
  disabled,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (next: boolean) => void;
}) => {
  return (
    <View style={[defaultStyles.item, { justifyContent: 'space-between', gap: 12, opacity: disabled ? 0.6 : 1 }]}> 
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, color: '#000' }}>{title}</Text>
        {!!subtitle && <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
};

const ensureNotificationPermission = async (): Promise<boolean> => {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

const Page = () => {
  const { t } = useI18n();
  const title = useMemo(() => t('app_updates.title'), [t]);

  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<AppUpdatesSettings>({ autoUpdate: false, notifyAvailable: true });

  const currentVersion = useMemo(() => Application.nativeApplicationVersion ?? '0.0.0', []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getStoredAppUpdatesSettings();
      if (cancelled) return;
      setSettings(stored);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void setStoredAppUpdatesSettings(settings);
    void ensureAppUpdatesTaskAsync();
  }, [loaded, settings]);

  const onToggleAutoUpdate = async (next: boolean) => {
    if (next) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(t('app_updates.permission_title'), t('app_updates.permission_message'));
        return;
      }
    }
    setSettings((prev) => ({ ...prev, autoUpdate: next }));
  };

  const onToggleNotify = async (next: boolean) => {
    if (next) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(t('app_updates.permission_title'), t('app_updates.permission_message'));
        return;
      }
    }
    setSettings((prev) => ({ ...prev, notifyAvailable: next }));
  };

  const notifyDisabled = settings.autoUpdate;

  const notifySubtitle = settings.autoUpdate
    ? t('app_updates.notify_disabled_subtitle')
    : t('app_updates.notify_subtitle');

  const autoSubtitle = Platform.OS === 'ios' ? t('app_updates.auto_update_ios_subtitle') : t('app_updates.auto_update_subtitle');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ title }} />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={defaultStyles.block}>
          <View style={defaultStyles.item}>
            <Text style={{ fontSize: 18, color: '#000' }}>{t('app_updates.current_version')}</Text>
            <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>{currentVersion}</Text>
          </View>
        </View>

        <View style={defaultStyles.block}>
          <Row
            title={t('app_updates.auto_update')}
            subtitle={autoSubtitle}
            value={settings.autoUpdate}
            onValueChange={(next) => void onToggleAutoUpdate(next)}
          />
          <View style={defaultStyles.separator} />
          <Row
            title={t('app_updates.notify')}
            subtitle={notifySubtitle}
            value={settings.notifyAvailable}
            disabled={notifyDisabled}
            onValueChange={(next) => void onToggleNotify(next)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
