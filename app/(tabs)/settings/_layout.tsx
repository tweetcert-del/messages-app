import { getColors } from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';

const Layout = () => {
  const isIOS = Platform.OS === 'ios';
  const { t } = useI18n();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('settings.title'),
          ...(isIOS
            ? {
                headerLargeTitle: true,
              }
            : {
                headerTitleAlign: 'left',
              }),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
          headerTintColor: Colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/chats')} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={26} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="account"
        options={{
          title: t('account.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />

      <Stack.Screen
        name="notifications"
        options={{
          title: t('notifications.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />

      <Stack.Screen
        name="app-updates"
        options={{
          title: t('app_updates.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />

      <Stack.Screen
        name="linked-devices"
        options={{
          title: t('linked_devices.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />

      <Stack.Screen
        name="link-device"
        options={{
          title: t('link_device.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />

      <Stack.Screen
        name="phone-numbers"
        options={{
          title: t('phone_numbers.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />

      <Stack.Screen
        name="appearance"
        options={{
          title: t('appearance.title'),
          headerStyle: { backgroundColor: isIOS ? Colors.background : Colors.headerBackground },
        }}
      />
    </Stack>
  );
};
export default Layout;
