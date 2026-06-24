import BoxedIcon from '@/components/BoxedIcon';
import { getColors } from '@/constants/Colors';
import { makeStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, View, ScrollView, Text, FlatList, BackHandler } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useEffect } from 'react';

const { useAuth } = Platform.OS === 'web' ? require('@clerk/clerk-react') : require('@clerk/clerk-expo');
const Page = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  const themeStyles = makeStyles(isDark);

  useEffect(() => {
    const onBack = () => {
      router.push('/(tabs)/chats');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [router]);

  const devices = [
    {
      name: t('settings.linked_devices'),
      icon: 'laptop-outline',
      backgroundColor: Colors.green,
      route: '/(tabs)/settings/linked-devices',
    },
  ];

  const items = [
    {
      name: t('settings.appearance'),
      icon: isDark ? 'moon' : 'sunny',
      backgroundColor: Colors.primary,
      route: '/(tabs)/settings/appearance',
    },
    {
      name: t('settings.language'),
      icon: 'globe',
      backgroundColor: Colors.primary,
      route: '/language',
    },
    {
      name: t('settings.app_updates'),
      icon: 'cloud-download',
      backgroundColor: Colors.primary,
      route: '/(tabs)/settings/app-updates',
    },
    {
      name: t('settings.account'),
      icon: 'key',
      backgroundColor: Colors.primary,
      route: '/(tabs)/settings/account',
    },
    {
      name: t('phone_numbers.title'),
      icon: 'call',
      backgroundColor: Colors.green,
      route: '/(tabs)/settings/phone-numbers',
    },
    {
      name: t('settings.privacy'),
      icon: 'lock-closed',
      backgroundColor: '#33A5D1',
    },
    {
      name: t('settings.chats'),
      icon: 'logo-whatsapp',
      backgroundColor: Colors.green,
    },
    {
      name: t('settings.notifications'),
      icon: 'notifications',
      backgroundColor: Colors.red,
      route: '/(tabs)/settings/notifications',
    },
    {
      name: t('settings.storage_data'),
      icon: 'repeat',
      backgroundColor: Colors.green,
    },
  ];

  const support = [
    {
      name: t('settings.help'),
      icon: 'information',
      backgroundColor: Colors.primary,
    },
    {
      name: t('settings.tell_friend'),
      icon: 'heart',
      backgroundColor: Colors.red,
    },
  ];
  const { signOut } = useAuth();

  const onSignOut = () => {
    signOut();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={themeStyles.block}>
          <FlatList
            data={devices}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={themeStyles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                disabled={!('route' in item)}
                activeOpacity={'route' in item ? 0.7 : 1}
                onPress={() => {
                  if ('route' in item) {
                    router.push((item as any).route);
                  }
                }}>
                <View style={themeStyles.item}>
                  <BoxedIcon name={item.icon} backgroundColor={item.backgroundColor} />

                  <Text style={{ fontSize: 18, flex: 1, color: Colors.text }}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={themeStyles.block}>
          <FlatList
            data={items}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={themeStyles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                disabled={!('route' in item)}
                activeOpacity={'route' in item ? 0.7 : 1}
                onPress={() => {
                  if ('route' in item) {
                    router.push((item as any).route);
                  }
                }}>
                <View style={themeStyles.item}>
                  <BoxedIcon name={item.icon} backgroundColor={item.backgroundColor} />

                  <Text style={{ fontSize: 18, flex: 1, color: Colors.text }}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={themeStyles.block}>
          <FlatList
            data={support}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={themeStyles.separator} />}
            renderItem={({ item }) => (
              <View style={themeStyles.item}>
                <BoxedIcon name={item.icon} backgroundColor={item.backgroundColor} />

                <Text style={{ fontSize: 18, flex: 1, color: Colors.text }}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </View>
            )}
          />
        </View>

        <TouchableOpacity onPress={onSignOut}>
          <Text
            style={{
              color: Colors.primary,
              fontSize: 18,
              textAlign: 'center',
              paddingVertical: 14,
            }}>
            {t('settings.log_out')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Page;
