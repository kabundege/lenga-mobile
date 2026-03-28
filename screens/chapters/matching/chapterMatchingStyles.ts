import colors from '@/utils/theme/colors';
import { CARD_SIZE } from '@/components/cards/MatchingQuestionCard';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet } from 'react-native';
import { globalStyles } from '@/utils/styles';

export const chapterMatchingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingVertical: themeToken.paddingLg,
    paddingHorizontal: themeToken.padding,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: themeToken.paddingLg,
    alignItems: 'center',
  },
  columns: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: themeToken.paddingLg,
  },
  column: {
    ...globalStyles.w_full_screen,
    justifyContent: 'center',
    gap: themeToken.spacing,
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  separator: {
    height: 1,
    alignSelf: 'stretch',
    ...globalStyles.w_full_screen,
    backgroundColor: colors.border.primary,
    marginHorizontal: themeToken.paddingSm,
  },
  ghost: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ghostThumb: {
    width: '90%',
    height: '90%',
  },
});
