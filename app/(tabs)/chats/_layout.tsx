import { getColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

function HeaderMenu() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);

  const options = [
    {
      label: t('menu.new_group'),
      icon: 'people-outline',
      onPress: () => {
        setVisible(false);
        router.push('/(modals)/new-chat');
      },
    },
    {
      label: t('menu.linked_devices'),
      icon: 'laptop-outline',
      onPress: () => {
        setVisible(false);
        router.push('/(tabs)/settings/linked-devices');
      },
    },
    {
      label: t('menu.mark_all_read'),
      icon: 'checkmark-done-outline',
      onPress: () => {
        setVisible(false);
        // TODO: implement mark all as read
      },
    },
    {
      label: t('menu.settings'),
      icon: 'settings-outline',
      onPress: () => {
        setVisible(false);
        router.push('/(tabs)/settings');
      },
    },
  ];

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Ionicons name="ellipsis-vertical" color={Colors.primary} size={24} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1} onPress={() => setVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <View style={{ backgroundColor: Colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingVertical: 8 }}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={opt.onPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                }}>
                <Ionicons name={opt.icon as any} size={22} color={Colors.primary} />
                <Text style={{ fontSize: 16, color: Colors.text }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                alignItems: 'center',
                paddingVertical: 14,
                marginTop: 4,
                borderTopWidth: 1,
                borderTopColor: Colors.separator,
              }}>
              <Text style={{ fontSize: 16, color: Colors.primary }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const Layout = () => {
  const isIOS = Platform.OS === 'ios';
  const { t } = useI18n();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t('header.messages'),
          ...(isIOS
            ? {
                headerLargeTitle: true,
                ...(isDark
                  ? {
                      headerTransparent: false,
                      headerStyle: { backgroundColor: Colors.background },
                    }
                  : {
                      headerTransparent: true,
                      headerBlurEffect: 'regular',
                    }),
                headerSearchBarOptions: {
                  placeholder: t('common.search'),
                },
              }
            : {
                headerStyle: { backgroundColor: Colors.headerBackground },
                headerTitleAlign: 'left',
              }),
          headerTintColor: Colors.text,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity>
                <Ionicons name="camera-outline" color={Colors.primary} size={28} />
              </TouchableOpacity>
              <Link href="/(modals)/new-chat" asChild>
                <TouchableOpacity>
                  <Ionicons name="add-circle" color={Colors.primary} size={28} />
                </TouchableOpacity>
              </Link>
              <HeaderMenu />
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          headerBackTitleVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 30 }}>
              <TouchableOpacity>
                <Ionicons name="videocam-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="call-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: isIOS ? Colors.background : Colors.headerBackground,
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
