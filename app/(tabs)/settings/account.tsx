import Colors from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import { Platform, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useI18n } from '@/lib/i18n';

const { useAuth, useUser } = Platform.OS === 'web' ? require('@clerk/clerk-react') : require('@clerk/clerk-expo');

const Page = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { signOut } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();

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
        <Stack.Screen options={{ title: t('account.title') }} />
        <Text style={{ color: Colors.gray, fontSize: 16, marginBottom: 12 }}>{t('account.not_signed_in')}</Text>
        <TouchableOpacity
          onPress={() => router.replace('/sign-in')}
          activeOpacity={0.8}
          style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            {t('account.go_to_sign_in')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? 'Account';
  const email = user.primaryEmailAddress?.emailAddress ?? '';
  const imageUrl = user.imageUrl;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
      <Stack.Screen options={{ title: t('account.title') }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <Image
          source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>{displayName}</Text>
          {!!email && <Text style={{ fontSize: 14, color: Colors.gray, marginTop: 2 }}>{email}</Text>}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => signOut()}
        activeOpacity={0.8}
        style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14 }}>
        <Text style={{ color: Colors.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
          {t('common.log_out')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Page;
