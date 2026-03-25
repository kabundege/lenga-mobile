import { themeToken } from '@/utils/theme/styles';
import { StyleSheet, View } from 'react-native';
import { LessonCardSkeleton } from './LessonCardSkeleton';

const SKELETON_COUNT = 5;

export const LessonsListSkeleton = () => (
  <View>
    {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
      <View
        key={index}
        style={[styles.item, { opacity: 1 - index * 0.15 }]}
      >
        <LessonCardSkeleton />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  item: {
    marginBottom: themeToken.spacingLg,
  },
});
