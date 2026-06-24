import { Platform } from 'react-native';

const isAndroidLike = Platform.OS === 'android' || Platform.OS === 'web';

export type ThemeColors = {
  primary: string;
  muted: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  gray: string;
  lightGray: string;
  green: string;
  lightGreen: string;
  red: string;
  yellow: string;
  separator: string;
  icon: string;
  headerBackground: string;
  searchBackground: string;
};

const light: ThemeColors = {
  primary: isAndroidLike ? '#25D366' : '#1063FD',
  muted: isAndroidLike ? '#1F7A52' : '#3A5A92',
  background: isAndroidLike ? '#F5F5F5' : '#EFEEF6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  textMuted: '#6E6E73',
  gray: '#6E6E73',
  lightGray: '#DCDCE2',
  green: '#25D366',
  lightGreen: '#DBFFCB',
  red: '#EF0827',
  yellow: '#FCC70B',
  separator: '#DCDCE2',
  icon: '#6E6E73',
  headerBackground: isAndroidLike ? '#FFFFFF' : '#EFEEF6',
  searchBackground: isAndroidLike ? '#F0F0F0' : '#E5E5EA',
};

const dark: ThemeColors = {
  primary: '#00A884',
  muted: '#8696A0',
  background: '#0F111A',
  surface: '#1A1D2E',
  card: '#252840',
  text: '#E0E0E0',
  textMuted: '#8E92A3',
  gray: '#8696A0',
  lightGray: '#2D3142',
  green: '#00A884',
  lightGreen: '#1F3B34',
  red: '#EF0827',
  yellow: '#FCC70B',
  separator: '#2D3142',
  icon: '#8696A0',
  headerBackground: '#1A1D2E',
  searchBackground: '#252840',
};

export const getColors = (isDark: boolean): ThemeColors => (isDark ? dark : light);

const Colors = light;

export default Colors;
