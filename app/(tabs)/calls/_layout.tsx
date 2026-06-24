import { getColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

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
          title: t('tabs.calls'),
          ...(isIOS
            ? {
                headerLargeTitle: true,
                headerTransparent: true,
                headerBlurEffect: 'regular',
                headerSearchBarOptions: {
                  placeholder: t('common.search'),
                },
              }
            : {
                headerStyle: { backgroundColor: Colors.headerBackground },
                headerTitleAlign: 'left',
              }),
          headerStyle: {
            backgroundColor: isIOS ? Colors.background : Colors.headerBackground,
          },
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="call-outline" color={Colors.primary} size={30} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};
export default Layout;
