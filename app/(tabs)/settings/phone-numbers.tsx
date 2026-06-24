import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useI18n } from '@/lib/i18n';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const isAndroidLike = Platform.OS === 'android' || Platform.OS === 'web';

type Step = 'input' | 'checking' | 'verify' | 'credentials' | 'adding';

const Page = () => {
  const { t } = useI18n();
  const { isAuthenticated } = useConvexAuth();

  const phoneNumbers = useQuery(
    api.phoneNumbers.listMyPhoneNumbers,
    isAuthenticated ? undefined : 'skip'
  ) as any[] | undefined;

  const checkExists = useMutation(api.phoneNumbers.checkPhoneNumberExists);
  const addVerified = useMutation(api.phoneNumbers.addVerifiedPhoneNumber);
  const deletePhone = useMutation(api.phoneNumbers.deletePhoneNumber);
  const setDefault = useMutation(api.phoneNumbers.setDefaultPhoneNumber);

  const [newNumber, setNewNumber] = useState('');
  const [label, setLabel] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState('');
  const [showDidww, setShowDidww] = useState(false);

  const resetFlow = () => {
    setNewNumber('');
    setLabel('');
    setWhatsappToken('');
    setWhatsappPhoneNumberId('');
    setError('');
    setStep('input');
  };

  const handleStartVerification = async () => {
    if (!newNumber.trim()) return;
    setError('');
    setStep('checking');
    try {
      const result = await checkExists({ number: newNumber.trim() });
      if (result.exists) {
        setError(t('phone_numbers.already_linked'));
        setStep('input');
        return;
      }
      setStep('verify');
    } catch (err: any) {
      setError(err.message || t('phone_numbers.check_error'));
      setStep('input');
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const url = event.url;
      if (!url) return;
      const parsed = Linking.parse(url);
      if (parsed.scheme === 'myapp' && parsed.hostname === 'whatsapp-callback') {
        const token = parsed.queryParams?.token as string | undefined;
        const phoneId = parsed.queryParams?.phone_number_id as string | undefined;
        if (token) setWhatsappToken(token);
        if (phoneId) setWhatsappPhoneNumberId(phoneId);
        setStep('credentials');
      }
    });
    return () => subscription.remove();
  }, []);

  const openEmbeddedSignup = async () => {
    const appId = process.env.EXPO_PUBLIC_META_APP_ID;
    const configId = process.env.EXPO_PUBLIC_META_EMBEDDED_CONFIG_ID;

    if (!appId || !configId) {
      Alert.alert(
        t('phone_numbers.embedded_signup'),
        t('phone_numbers.missing_config')
      );
      setStep('credentials');
      return;
    }

    const redirectUri = encodeURIComponent('myapp://whatsapp-callback');
    const url = `https://business.facebook.com/wa/embed/signup?app_id=${encodeURIComponent(appId)}&config_id=${encodeURIComponent(configId)}&redirect_uri=${redirectUri}`;
    await WebBrowser.openBrowserAsync(url);
  };

  const handleAddVerified = async () => {
    if (!newNumber.trim() || !whatsappToken.trim() || !whatsappPhoneNumberId.trim()) return;
    setError('');
    setStep('adding');
    try {
      await addVerified({
        number: newNumber.trim(),
        label: label.trim() || undefined,
        whatsappToken: whatsappToken.trim(),
        whatsappPhoneNumberId: whatsappPhoneNumberId.trim(),
      });
      resetFlow();
    } catch (err: any) {
      setError(err.message || t('phone_numbers.add_error'));
      setStep('credentials');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('phone_numbers.delete_title'),
      t('phone_numbers.delete_message'),
      [
        { text: t('common.cancel') || 'Cancelar', style: 'cancel' },
        {
          text: t('phone_numbers.delete') || 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhone({ phoneNumberId: id as any });
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al eliminar');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault({ phoneNumberId: id as any });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al establecer principal');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Stack.Screen options={{ title: t('phone_numbers.title') }} />
        <Text style={{ color: Colors.gray, fontSize: 16 }}>{t('account.not_signed_in')}</Text>
      </View>
    );
  }

  const active =
    phoneNumbers?.find((p) => p.isDefault) || phoneNumbers?.[0];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ title: t('phone_numbers.title') }} />

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 40 }}>
        {phoneNumbers === undefined ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : phoneNumbers.length === 0 ? (
          <View style={[defaultStyles.block, { padding: 16 }]}>
            <Text style={{ color: Colors.gray, fontSize: 15, textAlign: 'center' }}>
              {t('phone_numbers.no_numbers')}
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.gray, marginHorizontal: isAndroidLike ? 14 : 20, marginTop: 16, marginBottom: 6, textTransform: 'uppercase' }}>
              {t('phone_numbers.your_numbers')}
            </Text>
            <View style={defaultStyles.block}>
              {phoneNumbers.map((phone, index) => (
                <View key={phone._id}>
                  {index > 0 && <View style={defaultStyles.separator} />}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: isAndroidLike ? 14 : 12,
                      gap: 10,
                    }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600' }}>
                        {phone.label || phone.number}
                      </Text>
                      <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>
                        {phone.number}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        {phone.status === 'active' && (
                          <View
                            style={{
                              backgroundColor: '#DCF8C6',
                              borderRadius: 10,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}>
                            <Text style={{ fontSize: 11, color: '#1F7A52', fontWeight: '600' }}>
                              {t('phone_numbers.active')}
                            </Text>
                          </View>
                        )}
                        {phone.status === 'pending' && (
                          <View
                            style={{
                              backgroundColor: '#FFF9C4',
                              borderRadius: 10,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}>
                            <Text style={{ fontSize: 11, color: '#F57F17', fontWeight: '600' }}>
                              {t('phone_numbers.pending')}
                            </Text>
                          </View>
                        )}
                        {phone._id === active?._id && (
                          <View
                            style={{
                              backgroundColor: Colors.green,
                              borderRadius: 10,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}>
                            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>
                              {t('phone_numbers.default')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {phone._id !== active?._id && (
                        <TouchableOpacity
                          onPress={() => handleSetDefault(phone._id)}
                          activeOpacity={0.7}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: '#E8F5E9',
                          }}>
                          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.green} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDelete(phone._id)}
                        activeOpacity={0.7}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: '#FFEBEE',
                        }}>
                        <Ionicons name="trash-outline" size={20} color={Colors.red} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {step === 'input' && (
          <View style={[defaultStyles.block, { padding: isAndroidLike ? 14 : 12 }]}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.gray, marginBottom: 10, textTransform: 'uppercase' }}>
              {t('phone_numbers.add_existing')}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.lightGray,
                marginBottom: 8,
              }}
              placeholder={t('phone_numbers.number_placeholder')}
              placeholderTextColor={Colors.gray}
              keyboardType="phone-pad"
              value={newNumber}
              onChangeText={setNewNumber}
            />
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.lightGray,
                marginBottom: 10,
              }}
              placeholder={t('phone_numbers.label_placeholder')}
              placeholderTextColor={Colors.gray}
              value={label}
              onChangeText={setLabel}
            />
            {!!error && (
              <Text style={{ fontSize: 13, color: Colors.red, marginBottom: 8 }}>{error}</Text>
            )}
            <TouchableOpacity
              onPress={handleStartVerification}
              disabled={!newNumber.trim()}
              activeOpacity={0.8}
              style={{
                backgroundColor: !newNumber.trim() ? Colors.lightGray : Colors.green,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {t('phone_numbers.verify_whatsapp')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'checking' && (
          <View style={[defaultStyles.block, { padding: 24, alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.green} />
            <Text style={{ fontSize: 16, color: Colors.gray, marginTop: 12 }}>
              {t('phone_numbers.checking')}
            </Text>
          </View>
        )}

        {step === 'verify' && (
          <View style={[defaultStyles.block, { padding: isAndroidLike ? 14 : 12 }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              {t('phone_numbers.embedded_signup')}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.gray, marginBottom: 16, lineHeight: 20 }}>
              {t('phone_numbers.verify_description')}
            </Text>
            <View style={{ backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: '#1565C0' }}>
                {t('phone_numbers.number_to_verify')}: <Text style={{ fontWeight: '700' }}>{newNumber}</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={openEmbeddedSignup}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.green,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                marginBottom: 10,
              }}>
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {t('phone_numbers.open_signup')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('credentials')}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.lightGray,
              }}>
              <Text style={{ color: Colors.gray, fontSize: 14, fontWeight: '600' }}>
                {t('phone_numbers.already_verified')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetFlow}
              activeOpacity={0.8}
              style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: Colors.red, fontSize: 14 }}>
                {t('phone_numbers.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'credentials' && (
          <View style={[defaultStyles.block, { padding: isAndroidLike ? 14 : 12 }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              {t('phone_numbers.enter_credentials')}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.gray, marginBottom: 12 }}>
              {t('phone_numbers.credentials_description')}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.lightGray,
                marginBottom: 8,
              }}
              placeholder={t('phone_numbers.token_placeholder')}
              placeholderTextColor={Colors.gray}
              value={whatsappToken}
              onChangeText={setWhatsappToken}
              autoCapitalize="none"
            />
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.lightGray,
                marginBottom: 10,
              }}
              placeholder={t('phone_numbers.phone_id_placeholder')}
              placeholderTextColor={Colors.gray}
              value={whatsappPhoneNumberId}
              onChangeText={setWhatsappPhoneNumberId}
              autoCapitalize="none"
            />
            {!!error && (
              <Text style={{ fontSize: 13, color: Colors.red, marginBottom: 8 }}>{error}</Text>
            )}
            <TouchableOpacity
              onPress={handleAddVerified}
              disabled={!whatsappToken.trim() || !whatsappPhoneNumberId.trim()}
              activeOpacity={0.8}
              style={{
                backgroundColor: !whatsappToken.trim() || !whatsappPhoneNumberId.trim() ? Colors.lightGray : Colors.green,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                marginBottom: 10,
              }}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {t('phone_numbers.add')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetFlow}
              activeOpacity={0.8}
              style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.red, fontSize: 14 }}>
                {t('phone_numbers.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'adding' && (
          <View style={[defaultStyles.block, { padding: 24, alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.green} />
            <Text style={{ fontSize: 16, color: Colors.gray, marginTop: 12 }}>
              {t('phone_numbers.adding')}
            </Text>
          </View>
        )}

        {step === 'input' && (
          <View style={[defaultStyles.block, { padding: isAndroidLike ? 14 : 12 }]}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.gray, marginBottom: 10, textTransform: 'uppercase' }}>
              {t('phone_numbers.request_new')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDidww(true)}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors.lightGray,
              }}>
              <Ionicons name="call-outline" size={18} color={Colors.green} />
              <Text style={{ color: Colors.green, fontSize: 16, fontWeight: '600' }}>
                {t('phone_numbers.request_new')}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: Colors.gray, marginTop: 8, textAlign: 'center' }}>
              {t('phone_numbers.didww_info')}
            </Text>
          </View>
        )}
      </ScrollView>

      {showDidww && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 20,
              width: '100%',
              maxWidth: 400,
            }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              {t('phone_numbers.request_new')}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.gray, marginBottom: 12 }}>
              {t('phone_numbers.didww_description')}
            </Text>
            <View
              style={{
                backgroundColor: Colors.background,
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
              }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
                {t('phone_numbers.didww_steps_title')}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.gray, marginBottom: 2 }}>
                1. {t('phone_numbers.didww_step_1')}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.gray, marginBottom: 2 }}>
                2. {t('phone_numbers.didww_step_2')}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.gray, marginBottom: 2 }}>
                3. {t('phone_numbers.didww_step_3')}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.gray }}>
                4. {t('phone_numbers.didww_step_4')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDidww(false)}
              activeOpacity={0.8}
              style={{
                backgroundColor: Colors.green,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {t('phone_numbers.understood')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default Page;
