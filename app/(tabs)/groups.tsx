import { View, Text } from 'react-native';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/lib/theme';

const Page = () => {
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: Colors.textMuted }}>Groups</Text>
    </View>
  );
};
export default Page;
