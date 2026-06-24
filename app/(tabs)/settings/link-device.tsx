import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { api } from '@/convex/_generated/api';
import { useI18n } from '@/lib/i18n';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useRouter } from 'expo-router';
import { useAction } from 'convex/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';

const { useUser } = Platform.OS === 'web' ? require('@clerk/clerk-react') : require('@clerk/clerk-expo');

function parseMessagesLoginQr(data: string): { sessionId: string; secret: string } | null {
  const prefix = 'messages-login:';
  if (typeof data !== 'string' || !data.startsWith(prefix)) return null;

  const rest = data.slice(prefix.length);
  const idx = rest.indexOf(':');
  if (idx === -1) return null;

  const sessionId = rest.slice(0, idx).trim();
  const secret = rest.slice(idx + 1).trim();
  if (!sessionId || !secret) return null;

  return { sessionId, secret };
}

const Page = () => {
  const { t } = useI18n();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [permission, requestPermission] = useCameraPermissions();

  const approveSession = useAction(api.deviceLinking.approveSession);

  const [isApproving, setIsApproving] = useState(false);
  const [scanned, setScanned] = useState(false);
  const lastPayloadRef = useRef<string | null>(null);

  const hasPermission = permission?.granted ?? false;

  const onAskPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned || isApproving) return;

      const parsed = parseMessagesLoginQr(data);
      if (!parsed) return;

      if (lastPayloadRef.current === data) return;
      lastPayloadRef.current = data;

      setScanned(true);

      Alert.alert(
        t('link_device.confirm_title'),
        t('link_device.confirm_message'),
        [
          {
            text: t('link_device.cancel'),
            style: 'cancel',
            onPress: () => {
              setScanned(false);
            },
          },
          {
            text: t('link_device.confirm_action'),
            style: 'default',
            onPress: () => {
              void (async () => {
                setIsApproving(true);
                try {
                  if (Platform.OS !== 'web') {
                    const hasHardware = await LocalAuthentication.hasHardwareAsync();
                    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

                    if (!hasHardware || !isEnrolled) {
                      Alert.alert(
                        t('link_device.biometric_unavailable_title'),
                        t('link_device.biometric_unavailable_message')
                      );
                      setScanned(false);
                      return;
                    }

                    const result = await LocalAuthentication.authenticateAsync({
                      promptMessage: t('link_device.biometric_prompt'),
                      cancelLabel: t('link_device.cancel'),
                      fallbackLabel: t('link_device.biometric_fallback'),
                      disableDeviceFallback: true,
                    });

                    if (!result?.success) {
                      Alert.alert(t('link_device.biometric_failed_title'), t('link_device.biometric_failed_message'));
                      setScanned(false);
                      return;
                    }
                  }

                  await approveSession({
                    sessionId: parsed.sessionId as any,
                    secret: parsed.secret,
                  });
                  Alert.alert(t('link_device.success_title'), t('link_device.success_message'));
                  router.back();
                } catch (e: any) {
                  Alert.alert(
                    t('link_device.error_title'),
                    e?.message ?? t('link_device.error_message')
                  );
                  setScanned(false);
                } finally {
                  setIsApproving(false);
                }
              })();
            },
          },
        ]
      );
    },
    [approveSession, isApproving, router, scanned, t]
  );

  const title = useMemo(() => t('link_device.title'), [t]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <Stack.Screen options={{ title }} />
        <Text style={{ color: Colors.gray, fontSize: 16 }}>{t('account.not_signed_in')}</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
        <Stack.Screen options={{ title }} />
        <View style={defaultStyles.block}>
          <View style={defaultStyles.item}>
            <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>{t('link_device.camera_title')}</Text>
            <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 6 }}>{t('link_device.camera_description')}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => void onAskPermission()}
          activeOpacity={0.85}
          style={{
            marginTop: 14,
            backgroundColor: Colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t('link_device.grant_permission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Stack.Screen options={{ title }} />

      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
        <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14, padding: 14 }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{t('link_device.scan_title')}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 }}>
            {isApproving ? t('link_device.approving') : t('link_device.scan_description')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Page;
