import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'expo-router';

const { useSession, useUser } =
  Platform.OS === 'web' ? require('@clerk/clerk-react') : require('@clerk/clerk-expo');

const formatDateTime = (d?: Date | null) => {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString();
  }
};

const Page = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const { t } = useI18n();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[] | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const next = await user.getSessions();
      setSessions(next as any);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    void refresh();
  }, [isLoaded, isSignedIn, refresh, user]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <Stack.Screen options={{ title: t('linked_devices.title') }} />
        <Text style={{ color: Colors.gray, fontSize: 16 }}>{t('account.not_signed_in')}</Text>
      </View>
    );
  }

  const sessionsLoaded = sessions !== null;
  const sessionsArray = sessions ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ title: t('linked_devices.title') }} />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[defaultStyles.block, { marginBottom: 12 }]}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings/link-device')}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('link_device.cta')}</Text>
          </TouchableOpacity>
        </View>

        <View style={defaultStyles.block}>
          <View style={[defaultStyles.item, { justifyContent: 'space-between' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, color: '#000' }}>{t('linked_devices.devices')}</Text>
              <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>
                {sessionsLoaded
                  ? `${sessionsArray.length} ${
                      sessionsArray.length === 1
                        ? t('linked_devices.session_count_singular')
                        : t('linked_devices.session_count_plural')
                    }`
                  : t('linked_devices.tap_refresh')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => void refresh()}
              activeOpacity={0.8}
              style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 10 }}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                {isRefreshing ? '...' : t('common.refresh')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {sessionsLoaded && sessionsArray.length > 0 ? (
          <View style={defaultStyles.block}>
            {sessionsArray.map((s, idx) => {
              const isLast = idx === sessionsArray.length - 1;
              const status = s.status ?? 'unknown';
              const lastActiveAt = s.lastActiveAt ? new Date(s.lastActiveAt) : null;
              const expireAt = s.expireAt ? new Date(s.expireAt) : null;
              const isThisDevice = !!session?.id && s.id === session.id;

              const activity = s.latestActivity;
              const activityLine = activity
                ? [
                    activity.deviceType,
                    activity.browserName && activity.browserVersion
                      ? `${activity.browserName} ${activity.browserVersion}`
                      : activity.browserName,
                    activity.ipAddress,
                    activity.city,
                    activity.country,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : '';

              const onRevoke = async () => {
                await s.revoke?.();
                await refresh();
              };

              return (
                <View key={s.id ?? idx}>
                  <View style={[defaultStyles.item, { alignItems: 'flex-start' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>
                        {isThisDevice
                          ? t('linked_devices.this_device')
                          : `${t('linked_devices.session')} ${String(s.id ?? '').slice(0, 8)}`}
                      </Text>
                      <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 4 }}>
                        {t('linked_devices.status')}: {status}
                      </Text>
                      {!!activityLine && (
                        <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>
                          {activityLine}
                        </Text>
                      )}
                      {!!lastActiveAt && (
                        <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>
                          {t('linked_devices.last_active')}: {formatDateTime(lastActiveAt)}
                        </Text>
                      )}
                      {!!expireAt && (
                        <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>
                          {t('linked_devices.expires')}: {formatDateTime(expireAt)}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => void onRevoke()}
                      activeOpacity={0.8}
                      style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fff' }}>
                      <Text style={{ color: Colors.red, fontWeight: '600' }}>{t('common.sign_out')}</Text>
                    </TouchableOpacity>
                  </View>

                  {!isLast && <View style={defaultStyles.separator} />}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
            <Text style={{ color: Colors.gray }}>
              {sessionsLoaded ? t('linked_devices.no_active_sessions') : t('linked_devices.no_sessions_loaded')}
            </Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
          <Text style={{ color: Colors.gray, fontSize: 12 }}>
            {t('linked_devices.footer')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
