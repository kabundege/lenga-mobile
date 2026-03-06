import Chip from '@/components/common/chip';
import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography';
import type { StrapiCourseDetail } from '@/types/api';
import { globalStyles } from '@/utils/styles';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

type CourseDetailHeroProps = {
  course: StrapiCourseDetail;
  topicCount: number;
  lessonCount: number;
};

export function CourseDetailHero({
  course,
  topicCount,
  lessonCount,
}: CourseDetailHeroProps) {
  const honorableMentions = useMemo(() => {
    const mentions = [];
    if (course.courses_instructors) {
      if (course.courses_instructors.length > 0) {
        mentions.push(...course.courses_instructors.map((instructor) => ({ label: 'Instructor', name: instructor.full_name })));
      }
    }
    if (course.course_categories) {
      if (course.course_categories.length > 0) {
        mentions.push(...course.course_categories.map((category) => ({ label: 'Category', name: category.name })));
      }
    }
    if (course.course_provider_institutions) {
      if (course.course_provider_institutions.length > 0) {
        mentions.push(...course.course_provider_institutions.map((institution) => ({ label: 'Instructor Provider', name: institution.name })));
      }
    }
    return mentions;
  }, [course])
  return (
    <View style={globalStyles.gap_md}>
      <View style={globalStyles.px_lg}>
        <ThemedText type="title" style={globalStyles.text_primary}>
          {course.title}
        </ThemedText>
        <View style={globalStyles.gap_sm}>
          <TextBody variant="body2" color='secondary' strong>{topicCount} Topics
            &bull; {lessonCount} Lessons
          </TextBody>
        </View>
      </View>

      <ScrollView style={globalStyles.px_lg} horizontal showsHorizontalScrollIndicator={false}>
        {
          honorableMentions.map((mention, index) => (
            <Chip style={globalStyles.mr_xs} key={mention.name + index.toString()} label={mention.name} size='sm' variant='filled' sub={mention.label} />
          ))
        }
        <View style={globalStyles.w_xl} />
      </ScrollView>
      <View style={[globalStyles.gap_2xs, globalStyles.px_lg]}>
        <TextBody variant="body1" color='tertiary' strong>Description</TextBody>
        <TextBody variant="body2" color="secondary">
          {course.description.trim() || ''}
        </TextBody>
      </View>
    </View>
  );
}

