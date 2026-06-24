import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Colors from '@/constants/Colors';
import { Link } from 'expo-router';
import welcomeImage from '@/assets/images/welcome.png';
import { useI18n } from '@/lib/i18n';
const WelcomeScreen = () => {
  const { t } = useI18n();
  const openLink = () => {
    Linking.openURL('https://galaxies.dev');
  };

  return (
    <View style={styles.container}>
      <Image source={welcomeImage} style={styles.welcome} />
      <Text style={styles.headline}>{t('welcome.headline')}</Text>
      <Text style={styles.description}>
        {t('welcome.read_our')}{' '}
        <Text style={styles.link} onPress={openLink}>
          {t('welcome.privacy_policy')}
        </Text>
        . {t('welcome.tap_agree_continue')}{' '}
        <Text style={styles.link} onPress={openLink}>
          {t('welcome.terms_of_service')}
        </Text>
        .
      </Text>
      <Link href={'/sign-in'} replace asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{t('welcome.agree_continue')}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcome: {
    width: '100%',
    height: 300,
    borderRadius: 60,
    marginBottom: 80,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 80,
    color: Colors.gray,
  },
  link: {
    color: Colors.primary,
  },
  button: {
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
