import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { useFonts } from 'expo-font';
import { Link, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ConvexProviderWithAuth, ConvexReactClient, useConvexAuth, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { I18nProvider, useI18n } from '@/lib/i18n';

SplashScreen.preventAutoHideAsync();

const patchGlobalAtobForBase64Url = () => {
  const originalAtob = (globalThis as any)?.atob;
  if (typeof originalAtob !== 'function') return;

  (globalThis as any).atob = (data: string) => {
    if (typeof data !== 'string') return originalAtob(data);
    let normalized = data.replace(/-/g, '+').replace(/_/g, '/');
    const mod = normalized.length % 4;
    if (mod === 2) normalized += '==';
    else if (mod === 3) normalized += '=';
    else if (mod === 1) {
      throw new Error('Invalid base64/base64url string length');
    }
    return originalAtob(normalized);
  };
};

patchGlobalAtobForBase64Url();

const LANGUAGE_STORAGE_KEY = 'settings.language';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL');
}

const convex = new ConvexReactClient(CONVEX_URL);

const normalizeClerkPublishableKey = (key?: string) => {
  if (!key) return key;

  const sanitized = key.trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, '');
  const match = sanitized.match(/^(pk_(?:test|live)_)(.+)$/);
  if (!match) return sanitized;

  const prefix = match[1];
  let payload = match[2];

  const base64Encode = (input: string) => {
    if (typeof (globalThis as any)?.btoa === 'function') {
      return (globalThis as any).btoa(input);
    }

    const BufferCtor = (globalThis as any)?.Buffer;
    if (BufferCtor) {
      return BufferCtor.from(input, 'utf8').toString('base64');
    }

    throw new Error('No base64 encoder available to normalize Clerk publishable key');
  };

  const looksLikeBase64OrBase64Url = /^[A-Za-z0-9+/=_-]+$/.test(payload);
  if (!looksLikeBase64OrBase64Url) {
    const frontendApiWithDollar = payload.endsWith('$') ? payload : `${payload}$`;
    return `${prefix}${base64Encode(frontendApiWithDollar)}`;
  }

  payload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (payload.length % 4)) % 4;
  return `${prefix}${payload}${'='.repeat(padLen)}`;
};

function SyncMe() {
  const { isAuthenticated } = useConvexAuth();
  const syncMe = useMutation(api.users.syncMe);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    void syncMe();
  }, [isAuthenticated, syncMe]);

  return null;
}

function useClerkForConvex() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!isLoaded || !isSignedIn) return null;
      return getToken({ template: 'convex', skipCache: forceRefreshToken });
    },
    [getToken, isLoaded, isSignedIn]
  );

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: isLoaded ? (isSignedIn ?? false) : false,
      fetchAccessToken,
    }),
    [fetchAccessToken, isLoaded, isSignedIn]
  );
}

const InitialLayout = () => {
  const segments = useSegments();
  const topSegment = segments[0];
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { t } = useI18n();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const inLanguageScreen = topSegment === 'language';

    if (!isLoaded) return;

    const inTabsGroup = topSegment === '(tabs)';

    if (isSignedIn && !storedLanguage && !inLanguageScreen) {
      router.replace('/language');
      return;
    }

    if (isSignedIn && storedLanguage && !inTabsGroup && !inLanguageScreen) {
      router.replace('/(tabs)/chats');
      return;
    }

    if (!isSignedIn && inTabsGroup) {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, topSegment]);

  if (!loaded) {
    return <View />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ title: t('language.title') }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="-/oauth-native-callback" options={{ headerShown: false }} />
      <Stack.Screen
        name="otp"
        options={{ headerTitle: t('otp.title'), headerBackVisible: false }}
      />
      <Stack.Screen
        name="verify/[phone]"
        options={{
          title: t('otp.title'),
          headerShown: true,
          headerBackTitle: 'Edit number',
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/new-chat"
        options={{
          presentation: 'modal',
          title: t('new_chat.title'),
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerRight: () => (
            <Link href={'/(tabs)/chats'} asChild>
              <TouchableOpacity
                style={{ backgroundColor: Colors.lightGray, borderRadius: 20, padding: 4 }}>
                <Ionicons name="close" color={Colors.gray} size={30} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
    </Stack>
  );
};

export {
  ErrorBoundary,
} from 'expo-router';

const RootLayoutNav = () => {
  return (
    <ClerkProvider publishableKey={normalizeClerkPublishableKey(CLERK_PUBLISHABLE_KEY)!}>
      <ConvexProviderWithAuth client={convex} useAuth={useClerkForConvex}>
        <I18nProvider>
          <SyncMe />
          <InitialLayout />
        </I18nProvider>
      </ConvexProviderWithAuth>
    </ClerkProvider>
  );
};

export default RootLayoutNav;
