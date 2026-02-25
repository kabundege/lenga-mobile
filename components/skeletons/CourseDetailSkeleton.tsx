import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet, View } from 'react-native';
import { AnimatedSkeleton } from './AnimatedSkeleton';

export const CourseDetailSkeleton = () => (
  <View style={styles.container}>
    <AnimatedSkeleton style={styles.block}>
      <View style={styles.titleLine} />
      <View style={styles.descriptionBlock} />
      <View style={styles.categoryLine} />
      <View style={styles.buttonBlock} />
    </AnimatedSkeleton>
    <AnimatedSkeleton style={[styles.block, styles.sectionTitle]} children={<View style={styles.sectionTitle} />} />
    {[1, 2, 3].map((i) => (
      <AnimatedSkeleton key={i} style={styles.topicBlock}>
        <View style={styles.topicTitle} />
        <View style={styles.topicDesc} />
        <View style={styles.lessonLine} />
        <View style={styles.lessonLine} />
      </AnimatedSkeleton>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: themeToken.paddingLg,
    paddingTop: themeToken.spacing,
    gap: themeToken.spacingLg,
  },
  block: {
    backgroundColor: colors.background.tertiary,
    borderRadius: themeToken.borderRadius,
    padding: themeToken.padding,
  },
  titleLine: {
    width: '85%',
    height: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginBottom: themeToken.spacing,
  },
  descriptionBlock: {
    width: '100%',
    height: 48,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginBottom: themeToken.spacing,
  },
  categoryLine: {
    width: '40%',
    height: 14,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginBottom: themeToken.spacing,
  },
  buttonBlock: {
    width: 120,
    height: 44,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
  },
  sectionTitle: {
    height: 20,
    width: '30%',
  },
  topicBlock: {
    padding: themeToken.padding,
  },
  topicTitle: {
    width: '60%',
    height: 18,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginBottom: themeToken.spacingSm,
  },
  topicDesc: {
    width: '100%',
    height: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginBottom: themeToken.spacingSm,
  },
  lessonLine: {
    width: '90%',
    height: 14,
    backgroundColor: colors.background.secondary,
    borderRadius: themeToken.borderRadius,
    marginTop: themeToken.spacingSm,
    marginLeft: themeToken.spacing,
  },
});
