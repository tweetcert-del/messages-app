import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SignedOut, useOAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import appIcon from '@/assets/images/icon.png';

const Page = () => {
  const router = useRouter();
  const { t } = useI18n();
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);

  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const appleOAuth = useOAuth({ strategy: 'oauth_apple' });

  const actions = useMemo(
    () => [
      {
        key: 'oauth_google',
        label: t('auth.continue_google'),
        icon: 'logo-google',
        onPress: async () => {
          setLoadingStrategy('oauth_google');
          try {
            const { createdSessionId, setActive } = await googleOAuth.startOAuthFlow();
            if (createdSessionId && setActive) {
              await setActive({ session: createdSessionId });
            }
          } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Failed to sign in');
          } finally {
            setLoadingStrategy(null);
          }
        },
      },
      ...(Platform.OS === 'ios'
        ? [
            {
              key: 'oauth_apple',
              label: t('auth.continue_apple'),
              icon: 'logo-apple',
              onPress: async () => {
                setLoadingStrategy('oauth_apple');
                try {
                  const { createdSessionId, setActive } = await appleOAuth.startOAuthFlow();
                  if (createdSessionId && setActive) {
                    await setActive({ session: createdSessionId });
                  }
                } catch (e: any) {
                  Alert.alert('Error', e?.message ?? 'Failed to sign in');
                } finally {
                  setLoadingStrategy(null);
                }
              },
            },
          ]
        : []),
      {
        key: 'phone',
        label: t('auth.continue_phone'),
        icon: 'call-outline',
        onPress: () => {
          router.push('/otp');
        },
      },
    ],
    [appleOAuth, googleOAuth, router, t]
  );

  return (
    <SignedOut>
      <View style={styles.container}> 
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.hero}>
          <Image source={appIcon} style={styles.logo} />
          <Text style={styles.title}>{t('auth.sign_in')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        </View>

        <View style={styles.actions}>
          {actions.map((a) => {
            const isLoading = loadingStrategy === a.key;

            return (
              <TouchableOpacity
                key={a.key}
                onPress={a.onPress}
                activeOpacity={0.8}
                disabled={loadingStrategy !== null && loadingStrategy !== a.key}
                style={[styles.actionButton, isLoading ? styles.actionButtonLoading : null]}>
                <View style={styles.actionLeft}>
                  <Ionicons name={a.icon as any} size={20} color={Colors.gray} />
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </View>

                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <Text style={styles.legal}>{t('auth.legal')}</Text>
      </View>
    </SignedOut>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  actionButtonLoading: {
    opacity: 0.8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  legal: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    paddingBottom: 24,
  },
});

export default Page;
