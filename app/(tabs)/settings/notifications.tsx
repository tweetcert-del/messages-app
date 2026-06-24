import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, Switch, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useI18n } from '@/lib/i18n';

type NotificationSettings = {
  messageNotifications: boolean;
  groupNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  previews: boolean;
};

const STORAGE_KEY = 'settings.notifications';

const DEFAULTS: NotificationSettings = {
  messageNotifications: true,
  groupNotifications: true,
  sound: true,
  vibration: true,
  previews: true,
};

const getStored = async (): Promise<NotificationSettings | null> => {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    }

    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setStored = async (value: NotificationSettings) => {
  const raw = JSON.stringify(value);
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, raw);
};

const Row = ({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) => {
  return (
    <View style={[defaultStyles.item, { justifyContent: 'space-between', gap: 12 }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, color: '#000' }}>{title}</Text>
        {!!subtitle && <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
};

const Page = () => {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getStored();
      if (cancelled) return;
      if (stored) {
        setSettings({ ...DEFAULTS, ...stored });
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void setStored(settings);
  }, [loaded, settings]);

  const blocks = useMemo(
    () => [
      {
        key: 'messages',
        rows: [
          {
            key: 'messageNotifications',
            title: t('notifications.messages'),
            subtitle: t('notifications.messages_subtitle'),
          },
          {
            key: 'groupNotifications',
            title: t('notifications.groups'),
            subtitle: t('notifications.groups_subtitle'),
          },
        ] as const,
      },
      {
        key: 'behavior',
        rows: [
          {
            key: 'sound',
            title: t('notifications.sound'),
            subtitle: t('notifications.sound_subtitle'),
          },
          {
            key: 'vibration',
            title: t('notifications.vibration'),
            subtitle: t('notifications.vibration_subtitle'),
          },
          {
            key: 'previews',
            title: t('notifications.previews'),
            subtitle: t('notifications.previews_subtitle'),
          },
        ] as const,
      },
    ],
    [t]
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ title: t('notifications.title') }} />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        {blocks.map((block) => (
          <View key={block.key} style={defaultStyles.block}>
            {block.rows.map((r, idx) => {
              const isLast = idx === block.rows.length - 1;
              const key = r.key as keyof NotificationSettings;

              return (
                <View key={r.key}>
                  <Row
                    title={r.title}
                    subtitle={r.subtitle}
                    value={settings[key]}
                    onValueChange={(next) => setSettings((prev) => ({ ...prev, [key]: next }))}
                  />
                  {!isLast && <View style={defaultStyles.separator} />}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Page;
