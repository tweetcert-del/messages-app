import { getColors } from '@/constants/Colors';
import { Platform, StyleSheet } from 'react-native';

const isAndroidLike = Platform.OS === 'android' || Platform.OS === 'web';

export const makeStyles = (isDark: boolean) => {
  const Colors = getColors(isDark);
  return StyleSheet.create({
    block: {
      backgroundColor: Colors.card,
      borderRadius: isAndroidLike ? 0 : 10,
      marginHorizontal: isAndroidLike ? 0 : 14,
      marginTop: isAndroidLike ? 12 : 20,
      ...(isAndroidLike
        ? {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: Colors.separator,
          }
        : {}),
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isAndroidLike ? 14 : 10,
      gap: 10,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: Colors.separator,
      marginLeft: isAndroidLike ? 0 : 50,
    },
  });
};

export const defaultStyles = StyleSheet.create({
  block: {
    backgroundColor: '#fff',
    borderRadius: isAndroidLike ? 0 : 10,
    marginHorizontal: isAndroidLike ? 0 : 14,
    marginTop: isAndroidLike ? 12 : 20,
    ...(isAndroidLike
      ? {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: '#DCDCE2',
        }
      : {}),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isAndroidLike ? 14 : 10,
    gap: 10,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DCDCE2',
    marginLeft: isAndroidLike ? 0 : 50,
  },
});
