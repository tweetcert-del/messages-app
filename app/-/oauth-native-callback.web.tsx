import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

const Page = () => {
  const router = useRouter();

  useEffect(() => {
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
