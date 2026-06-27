import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getColors } from '@/constants/Colors';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';

const COUNTRIES = [
  { name: 'España', code: 'ES', prefix: '+34' },
  { name: 'Estados Unidos', code: 'US', prefix: '+1' },
  { name: 'Reino Unido', code: 'GB', prefix: '+44' },
  { name: 'Alemania', code: 'DE', prefix: '+49' },
  { name: 'Francia', code: 'FR', prefix: '+33' },
  { name: 'Italia', code: 'IT', prefix: '+39' },
  { name: 'México', code: 'MX', prefix: '+52' },
  { name: 'Colombia', code: 'CO', prefix: '+57' },
  { name: 'Argentina', code: 'AR', prefix: '+54' },
  { name: 'Chile', code: 'CL', prefix: '+56' },
  { name: 'Perú', code: 'PE', prefix: '+51' },
  { name: 'Brasil', code: 'BR', prefix: '+55' },
];

export default function NewChatPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { isDark } = useTheme();
  const dynamicColors = getColors(isDark);
  const [search, setSearch] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checking, setChecking] = useState(false);

  const me = useQuery(api.users.getMe);
  const users = useQuery(api.users.getUsers);
  const myPhoneNumbers = useQuery(api.phoneNumbers.listMyPhoneNumbers);
  const createConversation = useMutation(api.conversations.createConversation);
  const checkNumber = useMutation(api.phoneNumbers.checkPhoneNumberExists);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const lower = search.toLowerCase();
    return users.filter((u: any) =>
      (u.name ?? u.email ?? '').toLowerCase().includes(lower)
    );
  }, [users, search]);

  const whatsappNumbers = useMemo(() => {
    if (!myPhoneNumbers) return [];
    return myPhoneNumbers.filter((p: any) => p.provider === 'whatsapp' && p.status === 'active');
  }, [myPhoneNumbers]);

  const handleStartChat = async (otherUserId: string) => {
    if (!me) return;
    try {
      const conversationId = await createConversation({
        participants: [me._id, otherUserId],
        isGroup: false,
      });
      router.push(`/(tabs)/chats/${conversationId}` as any);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la conversación');
    }
  };

  const handleStartWhatsAppChat = async (phone: string) => {
    if (!me) return;
    try {
      const conversationId = await createConversation({
        participants: [me._id],
        isGroup: false,
        whatsappPhone: phone,
        isWhatsApp: true,
      });
      router.push(`/(tabs)/chats/${conversationId}` as any);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la conversación');
    }
  };

  const handleVerifyNumber = async () => {
    if (!phoneNumber.trim()) return;
    const fullNumber = `${selectedCountry.prefix}${phoneNumber.trim()}`;
    setChecking(true);
    try {
      const result = await checkNumber({ number: fullNumber });
      if (!result.exists) {
        const buttons: any[] = [{ text: t('common.cancel'), style: 'cancel' }];
        if (whatsappNumbers.length > 0) {
          buttons.push({
            text: 'WhatsApp',
            onPress: () => handleStartWhatsAppChat(fullNumber),
          });
        }
        Alert.alert(
          t('new_chat.number_not_registered'),
          t('new_chat.new_contact'),
          buttons
        );
      } else if (result.user) {
        Alert.alert(
          'Contacto encontrado',
          `${(result.user as any).name ?? (result.user as any).email}`,
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('new_chat.start_chat'),
              onPress: () => handleStartChat((result as any).ownerUserId!),
            },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Error al verificar');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: dynamicColors.background }}>
      <Stack.Screen options={{ title: t('new_chat.title') }} />

      <View style={[styles.searchContainer, { backgroundColor: dynamicColors.searchBackground }]}>
        <Ionicons name="search" size={18} color={dynamicColors.gray} />
        <TextInput
          style={[styles.searchInput, { color: dynamicColors.text }]}
          placeholder={t('new_chat.search_name_or_number')}
          placeholderTextColor={dynamicColors.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity
        style={[styles.addByNumberRow, { borderTopColor: dynamicColors.separator }]}
        onPress={() => setShowPhoneInput((s) => !s)}>
        <Ionicons name="add-circle-outline" size={24} color={dynamicColors.primary} />
        <Text style={[styles.addByNumberText, { color: dynamicColors.primary }]}>{t('new_chat.add_by_number')}</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: dynamicColors.gray }]}>WhatsApp Business</Text>
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => {
              const idx = COUNTRIES.indexOf(selectedCountry);
              setSelectedCountry(COUNTRIES[(idx + 1) % COUNTRIES.length]);
            }}>
            <Text style={[styles.countryText, { color: dynamicColors.text }]}>
              {selectedCountry.code} {selectedCountry.prefix}
            </Text>
            <Ionicons name="chevron-down" size={16} color={dynamicColors.gray} />
          </TouchableOpacity>
          <TextInput
            style={[styles.phoneInput, { borderColor: dynamicColors.lightGray, color: dynamicColors.text }]}
            placeholder="Número de WhatsApp"
            placeholderTextColor={dynamicColors.gray}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: '#25D366' }, !phoneNumber.trim() && { opacity: 0.6 }]}
            onPress={() => {
              if (!phoneNumber.trim()) return;
              handleStartWhatsAppChat(`${selectedCountry.prefix}${phoneNumber.trim()}`);
            }}
            disabled={!phoneNumber.trim()}>
            <Text style={[styles.verifyButtonText, { color: '#fff' }]}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPhoneInput && (
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => {
              const idx = COUNTRIES.indexOf(selectedCountry);
              setSelectedCountry(COUNTRIES[(idx + 1) % COUNTRIES.length]);
            }}>
            <Text style={[styles.countryText, { color: dynamicColors.text }]}>
              {selectedCountry.code} {selectedCountry.prefix}
            </Text>
            <Ionicons name="chevron-down" size={16} color={dynamicColors.gray} />
          </TouchableOpacity>
          <TextInput
            style={[styles.phoneInput, { borderColor: dynamicColors.lightGray, color: dynamicColors.text }]}
            placeholder={t('new_chat.phone_number')}
            placeholderTextColor={dynamicColors.gray}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: dynamicColors.primary }, checking && { opacity: 0.6 }]}
            onPress={handleVerifyNumber}
            disabled={checking}>
            {checking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.verifyButtonText, { color: '#fff' }]}>{t('new_chat.verify_number')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: dynamicColors.gray }]}>{t('new_chat.contacts_on_messages')}</Text>
        {!users ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : filteredUsers.length === 0 ? (
          <Text style={[styles.emptyText, { color: dynamicColors.textMuted }]}>{t('new_chat.no_users')}</Text>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item: any) => item._id}
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => handleStartChat(item._id)}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: dynamicColors.lightGray, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="person" size={18} color={dynamicColors.gray} />
                  </View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: dynamicColors.text }]}>{item.name ?? item.email}</Text>
                  <Text style={[styles.itemSubtitle, { color: dynamicColors.gray }]}>{item.email}</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={20} color={dynamicColors.primary} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: dynamicColors.separator, marginLeft: 60 }} />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  addByNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  addByNumberText: {
    marginLeft: 12,
    fontSize: 16,
  },
  phoneInputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  countryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
  },
  verifyButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  emptyText: {
    paddingVertical: 20,
  },
});
