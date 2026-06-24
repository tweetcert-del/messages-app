import { getColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

const TabsLayout = () => {
  const segments = useSegments();
  const isAndroid = Platform.OS === 'android';
  const { t } = useI18n();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  const inSettings = segments[1] === 'settings';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: isAndroid ? Colors.surface : Colors.background,
            display: inSettings ? 'none' : 'flex',
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveBackgroundColor: isAndroid ? Colors.surface : Colors.background,
          tabBarActiveBackgroundColor: isAndroid ? Colors.surface : Colors.background,
          headerStyle: {
            backgroundColor: isAndroid ? Colors.surface : Colors.background,
          },
          headerTitleAlign: isAndroid ? 'left' : 'center',
          headerShadowVisible: false,
        }}>
        <Tabs.Screen name="updates" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="communities" options={{ href: null }} />

        <Tabs.Screen
          name="chats"
          options={{
            title: t('tabs.chats'),
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isAndroid ? Colors.surface : Colors.background,
              display: segments[2] === '[id]' ? 'none' : 'flex',
            },
          }}
        />

        <Tabs.Screen
          name="groups"
          options={{
            title: t('tabs.groups'),
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="calls"
          options={{
            title: t('tabs.calls'),
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="phone-outline" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};
export default TabsLayout;
