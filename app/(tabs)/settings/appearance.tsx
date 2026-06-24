import { getColors } from '@/constants/Colors';
import { makeStyles } from '@/constants/Styles';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function AppearancePage() {
  const { t } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const Colors = getColors(isDark);
  const themeStyles = makeStyles(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ title: t('appearance.title') }} />

      <View style={themeStyles.block}>
        <View style={[themeStyles.item, styles.row]}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={24}
            color={Colors.primary}
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, color: Colors.text }}>
              {isDark ? t('appearance.dark') : t('appearance.light')}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textMuted }}>
              {t('appearance.description')}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? Colors.primary : '#f4f3f4'}
            trackColor={{ false: '#767577', true: Colors.lightGreen }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
  },
});
