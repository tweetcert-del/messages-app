import AppleStyleSwipeableRow from '@/components/AppleStyleSwipeableRow';
import { getColors } from '@/constants/Colors';
import { format } from 'date-fns';
import { Link } from 'expo-router';
import { FC } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { useTheme } from '@/lib/theme';

export interface ChatRowProps {
  id: string;
  from: string;
  date: string | number | Date;
  img?: string;
  msg: string;
  read: boolean;
  unreadCount: number;
}

const ChatRow: FC<ChatRowProps> = ({ id, from, date, img, msg, read, unreadCount }) => {
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  const imageSource = img ? { uri: img } : require('@/assets/images/icon.png');

  return (
    <AppleStyleSwipeableRow>
      <Link href={`/(tabs)/chats/${id}`} asChild>
        <TouchableHighlight activeOpacity={0.8} underlayColor={Colors.lightGray}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingLeft: 20,
              paddingVertical: 10,
            }}>
            <Image source={imageSource} style={{ width: 50, height: 50, borderRadius: 50 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text }}>{from}</Text>
              <Text style={{ fontSize: 16, color: Colors.textMuted }}>
                {msg.length > 40 ? `${msg.substring(0, 40)}...` : msg}
              </Text>
            </View>
            <Text style={{ color: Colors.textMuted, paddingRight: 20, alignSelf: 'flex-start' }}>
              {format(new Date(date), 'MM.dd.yy')}
            </Text>
          </View>
        </TouchableHighlight>
      </Link>
    </AppleStyleSwipeableRow>
  );
};
export default ChatRow;
