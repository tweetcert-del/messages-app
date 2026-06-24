import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    // This route exists to satisfy deep links coming back from expo-auth-session
    // (e.g. exp://.../-/oauth-native-callback?rotating_token_nonce=...)
    // Clerk's useOAuth hook handles the session finalization in the caller.
    // We just get out of the way.
    router.replace('/sign-in');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View />
    </View>
  );
};

export default Page;
