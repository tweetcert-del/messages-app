import ChatMessageBox from '@/components/ChatMessageBox';
import ReplyMessageBar from '@/components/ReplyMessageBar';
import Colors from '@/constants/Colors';
import { getColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  SystemMessage,
  IMessage,
} from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useI18n } from '@/lib/i18n';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';

const Page = () => {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const [showMenu, setShowMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { isDark } = useTheme();
  const Colors = getColors(isDark);

  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { isAuthenticated } = useConvexAuth();
  const { t } = useI18n();
  const me = useQuery(api.users.getMe, isAuthenticated ? undefined : 'skip') as any;
  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : 'skip'
  ) as any[] | undefined;
  const convexMessages = useQuery(
    api.messages.getMessages,
    isAuthenticated && conversationId ? { conversation: conversationId as any } : 'skip'
  ) as any[] | undefined;
  const sendTextMessage = useMutation(api.messages.sendTextMessage);
  const sendImage = useMutation(api.messages.sendImage);
  const sendVideo = useMutation(api.messages.sendVideo);
  const sendLocation = useMutation(api.messages.sendLocation);
  const sendContact = useMutation(api.messages.sendContact);
  const sendDocument = useMutation(api.messages.sendDocument);
  const sendWhatsAppMessage = useMutation(api.whatsapp.sendMessage);

  const activeConversation = useMemo(() => {
    if (!conversations || !conversationId) return null;
    return conversations.find((c) => c._id === conversationId) ?? null;
  }, [conversationId, conversations]);

  const headerTitle = useMemo(() => {
    if (!activeConversation) return '';
    return activeConversation.isGroup
      ? activeConversation.groupName ?? t('chats.group')
      : activeConversation.name ?? activeConversation.email ?? t('chats.chat');
  }, [activeConversation, t]);

  const headerImage = useMemo(() => {
    if (!activeConversation) return undefined;
    return activeConversation.isGroup ? activeConversation.groupImage : activeConversation.image;
  }, [activeConversation]);

  const messages = useMemo((): IMessage[] => {
    if (!convexMessages) return [];
    return [...convexMessages]
      .map((m) => {
        const sender = m.sender;
        const senderName =
          sender && typeof sender === 'object'
            ? sender.name ?? sender.email ?? 'Unknown'
            : typeof sender === 'string'
              ? sender
              : 'Unknown';
        const senderId =
          sender && typeof sender === 'object'
            ? sender._id ?? sender.name ?? 'system'
            : typeof sender === 'string'
              ? sender
              : 'system';

        const base: IMessage = {
          _id: m._id,
          createdAt: new Date(m._creationTime),
          user: {
            _id: senderId,
            name: senderName,
            avatar: sender && typeof sender === 'object' ? sender.image : undefined,
          },
          text: m.messageType === 'text' ? m.content ?? '' : '',
        };

        if (m.messageType === 'image') {
          return { ...base, image: m.content };
        }

        if (m.messageType === 'video') {
          return { ...base, text: '🎥 Video' };
        }

        if (m.messageType === 'location') {
          try {
            const loc = JSON.parse(m.content);
            return { ...base, text: `📍 Ubicación: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` };
          } catch {
            return { ...base, text: '📍 Ubicación compartida' };
          }
        }

        if (m.messageType === 'contact') {
          try {
            const c = JSON.parse(m.content);
            return { ...base, text: `👤 ${c.name}${c.phone ? '\n📞 ' + c.phone : ''}` };
          } catch {
            return { ...base, text: '👤 Contacto compartido' };
          }
        }

        if (m.messageType === 'document') {
          try {
            const d = JSON.parse(m.content);
            return { ...base, text: `📎 ${d.fileName ?? 'Documento'}` };
          } catch {
            return { ...base, text: '📎 Documento' };
          }
        }

        return base;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [convexMessages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.trim().toLowerCase();
    return messages.filter((m) => m.text?.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);
  const swipeableRowRef = useRef<Swipeable | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const enterSelectionMode = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, []);

  const copySelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const texts = messages
      .filter((m) => selectedIds.has(String(m._id)))
      .map((m) => m.text)
      .filter(Boolean)
      .join('\n');
    if (texts) {
      await Clipboard.setStringAsync(texts);
    }
    exitSelectionMode();
  }, [messages, selectedIds, exitSelectionMode]);

  const onSend = useCallback(
    async (outgoing: IMessage[] = []) => {
      const msg = outgoing[0];
      const content = msg?.text?.trim();
      if (!content || !conversationId || !me?._id) return;

      if (activeConversation?.isWhatsApp && activeConversation?.whatsappPhone) {
        await sendWhatsAppMessage({
          conversationId: conversationId as any,
          to: activeConversation.whatsappPhone,
          body: content,
          senderId: me._id,
        });
      } else {
        await sendTextMessage({
          content,
          conversation: conversationId as any,
          sender: me._id,
        });
      }

      setText('');
    },
    [conversationId, me?._id, sendTextMessage, sendWhatsAppMessage, activeConversation]
  );

  const uploadToConvexStorage = async (uri: string, fileName: string, type: string) => {
    const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error('Missing Convex URL');
    const formData = new FormData();
    formData.append('file', { uri, name: fileName, type } as any);
    const res = await fetch(`${convexUrl}/api/storage?action=upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return json.storageId as string;
  };

  const handleGallery = async () => {
    setShowAttachmentMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      const storageId = await uploadToConvexStorage(asset.uri, asset.fileName ?? 'image.jpg', asset.mimeType ?? 'image/jpeg');
      await sendImage({ imgId: storageId as any, sender: me._id, conversation: conversationId as any });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar la imagen');
    }
  };

  const handleCamera = async () => {
    setShowAttachmentMenu(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      const storageId = await uploadToConvexStorage(asset.uri, asset.fileName ?? 'camera.jpg', asset.mimeType ?? 'image/jpeg');
      await sendImage({ imgId: storageId as any, sender: me._id, conversation: conversationId as any });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar la foto');
    }
  };

  const handleLocation = async () => {
    setShowAttachmentMenu(false);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await sendLocation({
        sender: me._id,
        conversation: conversationId as any,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo obtener la ubicación');
    }
  };

  const handleContact = async () => {
    setShowAttachmentMenu(false);
    const permission = await Contacts.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Se necesita acceso a los contactos');
      return;
    }
    try {
      const contact = await Contacts.presentContactPickerAsync();
      if (!contact) return;
      const phone = contact.phoneNumbers?.[0]?.number ?? '';
      await sendContact({
        sender: me._id,
        conversation: conversationId as any,
        name: contact.name ?? 'Contacto',
        phone: phone || undefined,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el contacto');
    }
  };

  const handleDocument = async () => {
    setShowAttachmentMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const storageId = await uploadToConvexStorage(asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream');
      await sendDocument({
        docId: storageId as any,
        sender: me._id,
        conversation: conversationId as any,
        fileName: asset.name,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el documento');
    }
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{ backgroundColor: Colors.background }}
        renderActions={() => (
          <TouchableOpacity
            onPress={() => setShowAttachmentMenu(true)}
            style={{ width: 36, height: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="add" color={Colors.primary} size={24} />
          </TouchableOpacity>
        )}
      />
    );
  };

  const updateRowRef = useCallback(
    (ref: any) => {
      if (
        ref &&
        replyMessage &&
        ref.props.children.props.currentMessage?._id === replyMessage._id
      ) {
        swipeableRowRef.current = ref;
      }
    },
    [replyMessage]
  );

  useEffect(() => {
    if (replyMessage && swipeableRowRef.current) {
      swipeableRowRef.current.close();
      swipeableRowRef.current = null;
    }
  }, [replyMessage]);

  const ChatBackground: any = isDark ? View : ImageBackground;
  const chatBgProps: any = isDark
    ? { style: { flex: 1, backgroundColor: Colors.background, marginBottom: insets.bottom } }
    : { source: require('@/assets/images/pattern.png'), style: { flex: 1, backgroundColor: Colors.background, marginBottom: insets.bottom } };

  return (
    <ChatBackground {...chatBgProps}>
      <Stack.Screen
        options={{
          title: '',
          headerTitle: () => (
            <View
              style={{
                flexDirection: 'row',
                width: 220,
                alignItems: 'center',
                gap: 10,
                paddingBottom: 4,
              }}>
              {isSelectionMode ? (
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text }}>
                  {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
                </Text>
              ) : (
                <>
                  {headerImage ? (
                    <Image source={{ uri: headerImage }} style={{ width: 40, height: 40, borderRadius: 50 }} />
                  ) : (
                    <Image source={require('@/assets/images/icon.png')} style={{ width: 40, height: 40, borderRadius: 50 }} />
                  )}
                  <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>{headerTitle}</Text>
                </>
              )}
            </View>
          ),
          headerLeft: () => (
            isSelectionMode ? (
              <TouchableOpacity onPress={exitSelectionMode} style={{ marginLeft: 14 }}>
                <Ionicons name="close" size={26} color={Colors.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={26} color={Colors.text} />
              </TouchableOpacity>
            )
          ),
          headerRight: () => (
            isSelectionMode ? null : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 14 }}>
                <TouchableOpacity onPress={() => { /* TODO: audio call */ }}>
                  <Ionicons name="call" size={22} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { /* TODO: video call */ }}>
                  <Ionicons name="videocam" size={22} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowMenu(true)}>
                  <Ionicons name="ellipsis-vertical" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>
            )
          ),
        }}
      />

      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              backgroundColor: 'transparent',
            }}>
            <View
              style={{
                position: 'absolute',
                top: 56,
                right: 10,
                backgroundColor: Colors.card,
                borderRadius: 12,
                paddingVertical: 8,
                minWidth: 180,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 6,
              }}>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); setIsSearching(true); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <Ionicons name="search" size={18} color={Colors.gray} />
                <Text style={{ fontSize: 15, color: Colors.text }}>Buscar mensajes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); /* TODO: new group */ }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <Ionicons name="people" size={18} color={Colors.gray} />
                <Text style={{ fontSize: 15, color: Colors.text }}>Nuevo grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); /* TODO: view contact */ }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <Ionicons name="person" size={18} color={Colors.gray} />
                <Text style={{ fontSize: 15, color: Colors.text }}>Ver contacto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); /* TODO: mute notifications */ }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <Ionicons name="notifications-off" size={18} color={Colors.gray} />
                <Text style={{ fontSize: 15, color: Colors.text }}>Silenciar notificaciones</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); /* TODO: files */ }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                <Ionicons name="folder" size={18} color={Colors.gray} />
                <Text style={{ fontSize: 15, color: Colors.text }}>Archivos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      <Modal visible={showAttachmentMenu} transparent animationType="slide" onRequestClose={() => setShowAttachmentMenu(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowAttachmentMenu(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <View style={{ backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingHorizontal: 20, paddingVertical: 16 }}>
              <TouchableOpacity onPress={handleGallery} style={{ alignItems: 'center', width: 70, marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Ionicons name="images" size={26} color="#fff" />
                </View>
                <Text style={{ fontSize: 12, color: Colors.text }}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCamera} style={{ alignItems: 'center', width: 70, marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Ionicons name="camera" size={26} color="#fff" />
                </View>
                <Text style={{ fontSize: 12, color: Colors.text }}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLocation} style={{ alignItems: 'center', width: 70, marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EA4335', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Ionicons name="location" size={26} color="#fff" />
                </View>
                <Text style={{ fontSize: 12, color: Colors.text }}>Ubicación</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleContact} style={{ alignItems: 'center', width: 70, marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DA1F2', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Ionicons name="person" size={26} color="#fff" />
                </View>
                <Text style={{ fontSize: 12, color: Colors.text }}>Contacto</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDocument} style={{ alignItems: 'center', width: 70, marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#7B68EE', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Ionicons name="document" size={26} color="#fff" />
                </View>
                <Text style={{ fontSize: 12, color: Colors.text }}>Documento</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setShowAttachmentMenu(false)}
              style={{ alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.separator }}>
              <Text style={{ fontSize: 16, color: Colors.primary }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isSearching && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.background,
            zIndex: 90,
            paddingTop: insets.top + 8,
            paddingHorizontal: 14,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: Colors.lightGray,
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.searchBackground,
              borderRadius: 10,
              paddingHorizontal: 10,
              height: 40,
              gap: 6,
            }}>
            <Ionicons name="search" size={18} color={Colors.gray} />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: Colors.text }}
              placeholder="Buscar mensaje..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
            <Text style={{ fontSize: 16, color: Colors.primary, fontWeight: '600' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
      <GiftedChat
        messages={filteredMessages}
        onSend={(messages: any) => void onSend(messages)}
        onInputTextChanged={setText}
        user={{
          _id: me?._id ?? 'me',
        }}
        renderSystemMessage={(props) => (
          <SystemMessage {...props} textStyle={{ color: Colors.gray }} />
        )}
        bottomOffset={insets.bottom}
        renderAvatar={null}
        maxComposerHeight={100}
        textInputProps={{
          style: {
            flex: 1,
            backgroundColor: isDark ? Colors.card : '#fff',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: isDark ? Colors.separator : Colors.lightGray,
            paddingHorizontal: 10,
            paddingTop: 8,
            fontSize: 16,
            marginVertical: 4,
            color: Colors.text,
          },
        }}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{
                right: {
                  color: Colors.text,
                },
              }}
              wrapperStyle={{
                left: {
                  backgroundColor: Colors.card,
                },
                right: {
                  backgroundColor: Colors.lightGreen,
                },
              }}
            />
          );
        }}
        renderSend={(props) => (
          <View
            style={{
              width: 64,
              height: 44,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}>
            {text === '' && (
              <>
                <Ionicons name="camera-outline" color={Colors.primary} size={22} />
                <Ionicons name="mic-outline" color={Colors.primary} size={22} />
              </>
            )}
            {text !== '' && (
              <Send
                {...props}
                containerStyle={{
                  justifyContent: 'center',
                }}>
                <Ionicons name="send" color={Colors.primary} size={22} />
              </Send>
            )}
          </View>
        )}
        renderInputToolbar={renderInputToolbar}
        renderChatFooter={() => (
          <ReplyMessageBar clearReply={() => setReplyMessage(null)} message={replyMessage} />
        )}
        onPress={(context, message) => {
          if (isSelectionMode && message?._id) {
            toggleSelection(String(message._id));
          }
        }}
        onLongPress={(context, message) => {
          if (!isSelectionMode && message?._id) {
            enterSelectionMode(String(message._id));
          }
        }}
        renderMessage={(props) => (
          <ChatMessageBox
            {...props}
            setReplyOnSwipeOpen={setReplyMessage}
            updateRowRef={updateRowRef}
            isSelectionMode={isSelectionMode}
            isSelected={props.currentMessage ? selectedIds.has(String(props.currentMessage._id)) : false}
          />
        )}
      />

      {isSelectionMode && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: Colors.separator,
            paddingBottom: insets.bottom + 12,
            paddingTop: 12,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-around',
            zIndex: 50,
          }}>
          <TouchableOpacity
            onPress={copySelected}
            disabled={selectedIds.size === 0}
            style={{ alignItems: 'center', opacity: selectedIds.size === 0 ? 0.4 : 1 }}>
            <Ionicons name="copy-outline" size={24} color={Colors.primary} />
            <Text style={{ fontSize: 12, color: Colors.primary, marginTop: 4 }}>Copiar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={exitSelectionMode} style={{ alignItems: 'center' }}>
            <Ionicons name="close-circle-outline" size={24} color={Colors.gray} />
            <Text style={{ fontSize: 12, color: Colors.gray, marginTop: 4 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ChatBackground>
  );
};

export default Page;
