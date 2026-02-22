import { getFontSize } from '@/utils/functions/font';
import { moderateScale, scale } from 'react-native-size-matters';
import colors from './colors';

export const themeToken = {
  borderRadius: 16,
  paddingLg: moderateScale(20),
  padding: moderateScale(13),
  paddingSm: moderateScale(5),
  spacingLg: scale(20),
  spacing: scale(10),
  spacingSm: scale(5),
  controlHeight: {
    lg: scale(50),
    md: scale(45),
    sm: scale(35),
  },
  fontSizes: {
    heading: {
      heading: getFontSize(20),
      title: getFontSize(18),
      subTitle: getFontSize(13),
    },
    normal: {
      body1: getFontSize(13),
      body2: getFontSize(12),
      button: getFontSize(12),
      caption: getFontSize(11),
      overline: getFontSize(10),
    },
  },
  sizes: {
    '3xl': scale(90),
    '2xl': scale(40),
    xl: scale(30),
    lg: scale(20),
    md: scale(15),
    sm: scale(10),
  },
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
  },
};

export const commonStyles = {
  spaceFlexed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  background: {
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  shadow: {
    // iOS shadow properties
    shadowColor: colors.border.primary, // Shadow color
    shadowOffset: {
      width: 0, // Horizontal offset
      height: scale(4), // Vertical offset
    },
    shadowOpacity: 1, // Shadow opacity
    shadowRadius: 7, // Shadow blur radius

    // Android elevation property
    elevation: 5, // Shadow elevation
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  filledButtonRounded: {
    backgroundColor: colors.background.secondary,
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: themeToken.borderRadius,
    borderColor: colors.border.primary,
  },
  center: {
    alignSelf: 'center',
  },
  postCardContainer: {
    padding: themeToken.padding,
    backgroundColor: colors.background.tertiary,
    borderRadius: themeToken.borderRadius + 18,
    width: '100%',
  },
} as const;
