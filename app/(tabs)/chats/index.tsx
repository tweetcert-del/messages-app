import { View, Text, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import ChatRow from '@/components/ChatRow';
import { getColors } from '@/constants/Colors';
import { makeStyles } from '@/constants/Styles';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

const Page = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const Colors = getColors(isDark);
  const themeStyles = makeStyles(isDark);
  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : 'skip'
  ) as any[] | undefined;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const data = conversations ?? [];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 40, flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={data}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ color: Colors.textMuted }}>{t('chats.no_conversations')}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const title = item.isGroup
            ? item.groupName ?? t('chats.group')
            : item.name ?? item.email ?? t('chats.chat');
          const img = item.isGroup ? item.groupImage : item.image;
          const last = item.lastMessage;
          const msg =
            last?.messageType === 'text'
              ? last?.content ?? ''
              : last?.messageType === 'image'
                ? t('common.photo')
                : last?.messageType === 'video'
                  ? t('common.video')
                  : last?.messageType === 'location'
                    ? '📍 Ubicación'
                    : last?.messageType === 'contact'
                      ? '👤 Contacto'
                      : last?.messageType === 'document'
                        ? '📎 Documento'
                        : '';
          const date = last ? new Date(last._creationTime) : new Date(item._creationTime);
          return (
            <ChatRow
              id={item._id}
              from={title}
              date={date}
              img={img}
              msg={msg}
              read={true}
              unreadCount={0}
            />
          );
        }}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => (
          <View style={[themeStyles.separator, { marginLeft: 90 }]} />
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};
export default Page;
