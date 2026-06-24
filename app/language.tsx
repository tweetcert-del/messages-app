import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AppLanguage, useI18n } from '@/lib/i18n';

const LANGUAGE_STORAGE_KEY = 'settings.language';

type LanguageOption = {
  code: string;
  label: string;
  nativeLabel: string;
};

const isWeb = Platform.OS === 'web';

const getStoredLanguage = async () => {
  if (isWeb) return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
};

const setStoredLanguage = async (value: string) => {
  if (isWeb) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, value);
};

const Page = () => {
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const languages = useMemo<LanguageOption[]>(
    () => [
      { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
      { code: 'en', label: 'English', nativeLabel: 'English' },
      { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
      { code: 'fr', label: 'French', nativeLabel: 'Français' },
      { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getStoredLanguage();
        if (cancelled) return;
        setSelected(stored);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = async () => {
    if (!selected) return;
    await setLanguage(selected as AppLanguage);
    router.replace('/');
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Stack.Screen options={{ title: t('language.title') }} />

      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '600' }}>{t('language.select_title')}</Text>
        <Text style={{ fontSize: 14, color: Colors.gray, marginTop: 6 }}>
          {t('language.select_subtitle')}
        </Text>
      </View>

      <View style={defaultStyles.block}>
        <FlatList
          data={languages}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={defaultStyles.separator} />}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = item.code === selected;

            return (
              <TouchableOpacity
                onPress={() => setSelected(item.code)}
                style={defaultStyles.item}
                activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18 }}>{item.nativeLabel}</Text>
                  <Text style={{ fontSize: 13, color: Colors.gray, marginTop: 2 }}>{item.label}</Text>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark" size={22} color={Colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity
          onPress={onSave}
          disabled={!selected}
          activeOpacity={0.8}
          style={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: selected ? Colors.primary : Colors.lightGray,
            padding: 12,
            borderRadius: 10,
          }}>
          <Text
            style={{
              color: selected ? '#fff' : Colors.gray,
              fontSize: 18,
              fontWeight: '600',
            }}>
            {t('common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
