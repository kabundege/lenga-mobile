import { globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { flexBetween } from '@/utils/styles/reusable.style';
import { StyleSheet, View } from 'react-native';
import { AnimatedSkeleton } from './AnimatedSkeleton';

export const CourseCardSkeleton = () => {
  return (
    <AnimatedSkeleton style={styles.card}>
      <View>
        <View style={styles.titleBlock} />
        <View style={styles.descriptionBlock} />
      </View>
      <View style={styles.spacer} />
      <View style={[flexBetween, styles.footer]}>
        <View style={styles.footerLeft} />
        <View style={styles.footerRight} />
      </View>
    </AnimatedSkeleton>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.tertiary,
    ...globalStyles.rounded_md,
    ...globalStyles.p_md,
  },
  titleBlock: {
    width: '70%',
    height: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginBottom: 8,
  },
  descriptionBlock: {
    width: '100%',
    height: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
  },
  spacer: {
    height: themeToken.spacingLg,
  },
  footer: {
    ...globalStyles.pt_sm,
    ...globalStyles.border_t,
    borderColor: colors.primary,
  },
  footerLeft: {
    width: '45%',
    height: 28,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
  },
  footerRight: {
    width: '30%',
    height: 28,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
  },
});
