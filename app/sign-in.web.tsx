import Colors from '@/constants/Colors';
import { SignIn } from '@clerk/clerk-react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const Page = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Sign in</Text>
      <View style={styles.card}>
        <SignIn routing="hash" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
});

export default Page;
