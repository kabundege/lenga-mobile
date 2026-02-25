import { themeToken } from '@/utils/theme/styles';
import { StyleSheet, View } from 'react-native';
import { CourseCardSkeleton } from './CourseCardSkeleton';

const SKELETON_COUNT = 5;

export const CoursesListSkeleton = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View
          key={index}
          style={[styles.item, { opacity: 1 - index * 0.15 }]}
        >
          <CourseCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: themeToken.paddingLg,
  },
  item: {
    marginBottom: themeToken.spacingLg,
  },
});
