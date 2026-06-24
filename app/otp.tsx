import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useI18n } from '@/lib/i18n';

const Page = () => {
  const { t } = useI18n();
  const [nationalNumber, setNationalNumber] = useState('');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [country, setCountry] = useState({ name: 'Germany', callingCode: '49' });
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const countries = [
    { name: 'Germany', callingCode: '49' },
    { name: 'United States', callingCode: '1' },
    { name: 'United Kingdom', callingCode: '44' },
    { name: 'France', callingCode: '33' },
    { name: 'Spain', callingCode: '34' },
    { name: 'Mexico', callingCode: '52' },
  ];

  const nationalDigits = nationalNumber.replace(/\D+/g, '');
  const phoneNumberE164 = `+${country.callingCode}${nationalDigits}`;

  const openLink = () => {
    Linking.openURL('https://galaxies.dev');
  };

  const sendOTP = async () => {
    console.log('sendOTP', phoneNumberE164);
    setLoading(true);

    try {
      await signUp!.create({
        phoneNumber: phoneNumberE164,
      });
      console.log('TESafter createT: ', signUp!.createdSessionId);

      signUp!.preparePhoneNumberVerification();

      console.log('after prepare: ');
      router.push(`/verify/${encodeURIComponent(phoneNumberE164)}`);
    } catch (err) {
      console.log('error', JSON.stringify(err, null, 2));

      if (isClerkAPIResponseError(err)) {
        if (err.errors[0].code === 'form_identifier_exists') {
          // User signed up before
          console.log('User signed up before');
          await trySignIn();
        } else {
          setLoading(false);
          Alert.alert('Error', err.errors[0].message);
        }
      }
    }
  };

  const trySignIn = async () => {
    console.log('trySignIn', phoneNumberE164);

    const { supportedFirstFactors } = await signIn!.create({
      identifier: phoneNumberE164,
    });

    const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
      return factor.strategy === 'phone_code';
    });

    const { phoneNumberId } = firstPhoneFactor;

    await signIn!.prepareFirstFactor({
      strategy: 'phone_code',
      phoneNumberId,
    });

    router.push(`/verify/${encodeURIComponent(phoneNumberE164)}?signin=true`);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={{ flex: 1 }}
      behavior="padding">
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loading]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ fontSize: 18, padding: 10 }}>{t('otp.sending_code')}</Text>
        </View>
      )}

      <View style={styles.container}>
        <Text style={styles.description}>
          {t('otp.description')}
        </Text>

        <View style={styles.list}>
          <TouchableOpacity
            style={styles.listItem}
            activeOpacity={0.7}
            onPress={() => setCountryPickerOpen(true)}>
            <Text style={styles.listItemText}>{country.name}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </TouchableOpacity>
          <View style={styles.separator} />

          <View style={styles.phoneRow}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+{country.callingCode}</Text>
            </View>

            <TextInput
              value={nationalNumber}
              keyboardType="phone-pad"
              autoFocus
              placeholder={t('otp.phone_placeholder')}
              onChangeText={setNationalNumber}
              style={styles.nationalInput}
            />
          </View>
        </View>

        <Text style={styles.legal}>
          You must be{' '}
          <Text style={styles.link} onPress={openLink}>
            at least 16 years old
          </Text>{' '}
          to register. Learn how WhatsApp works with the{' '}
          <Text style={styles.link} onPress={openLink}>
            Meta Companies
          </Text>
          .
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.button,
            nationalDigits !== '' ? styles.enabled : null,
            { marginBottom: 20 },
          ]}
          onPress={sendOTP}>
          <Text style={[styles.buttonText, nationalDigits !== '' ? styles.enabled : null]}>
            {t('otp.next')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={countryPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCountryPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('otp.select_country')}</Text>
              <TouchableOpacity onPress={() => setCountryPickerOpen(false)}>
                <Ionicons name="close" size={26} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={countries}
              keyExtractor={(item) => item.callingCode + item.name}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => {
                const selected = item.callingCode === country.callingCode;

                return (
                  <TouchableOpacity
                    style={styles.modalRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setCountry(item);
                      setCountryPickerOpen(false);
                    }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalRowTitle}>{item.name}</Text>
                      <Text style={styles.modalRowSubtitle}>+{item.callingCode}</Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark" size={22} color={Colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    gap: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.gray,
  },
  legal: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
  link: {
    color: Colors.primary,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
    color: '#fff',
  },
  buttonText: {
    color: Colors.gray,
    fontSize: 22,
    fontWeight: '500',
  },
  list: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    marginBottom: 10,
  },
  listItemText: {
    fontSize: 18,
    color: Colors.primary,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.gray,
    opacity: 0.2,
  },

  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  prefixBox: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    minWidth: 70,
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 16,
    color: '#000',
  },
  nationalInput: {
    flex: 1,
    backgroundColor: '#fff',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lightGray,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalRowTitle: {
    fontSize: 16,
    color: '#000',
  },
  modalRowSubtitle: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 3,
  },

  loading: {
    zIndex: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Page;
