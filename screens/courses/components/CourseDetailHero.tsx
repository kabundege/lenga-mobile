import Button from '@/components/buttons/button';
import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography';
import type { StrapiCourseDetail } from '@/types/api';
import { globalStyles } from '@/utils/styles';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet, View } from 'react-native';

type CourseDetailHeroProps = {
  course: StrapiCourseDetail;
  showEnrollButton: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
};

export function CourseDetailHero({
  course,
  showEnrollButton,
  isEnrolling,
  onEnroll,
}: CourseDetailHeroProps) {
  const category = course.course_categories?.[0];
  return (
    <View style={globalStyles.gap_md}>
      <ThemedText type="title" style={globalStyles.text_primary}>
        {course.title}
      </ThemedText>
      <TextBody variant="body1" color="secondary" style={styles.description}>
        {course.description || ''}
      </TextBody>
      {category && (
        <TextBody variant="caption" color="secondary">
          {category.name}
        </TextBody>
      )}
      {showEnrollButton && (
        <Button
          rounded
          size="lg"
          type="light"
          onPress={onEnroll}
          label="Tangira Isomo"
          loading={isEnrolling}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: themeToken.spacing,
  },
  description: {
    marginBottom: themeToken.spacing,
  },
});
