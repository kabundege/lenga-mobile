import Chip from '@/components/common/chip';
import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography';
import type { StrapiCourseDetail } from '@/types/api';
import { globalStyles } from '@/utils/styles';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const honorableMentions = useMemo(() => {
    const mentions = [];
    if (course.courses_instructors) {
      if (course.courses_instructors.length > 0) {
        mentions.push(...course.courses_instructors.map((instructor) => ({ label: t('courses.instructor'), name: instructor.full_name })));
      }
    }
    if (course.course_categories) {
      if (course.course_categories.length > 0) {
        mentions.push(...course.course_categories.map((category) => ({ label: t('courses.category'), name: category.name })));
      }
    }
    if (course.course_provider_institutions) {
      if (course.course_provider_institutions.length > 0) {
        mentions.push(...course.course_provider_institutions.map((institution) => ({ label: t('courses.instructorProvider'), name: institution.name })));
      }
    }
    return mentions;
  }, [course, t]);
  return (
    <View style={globalStyles.gap_md}>
      <View style={globalStyles.px_lg}>
        <ThemedText type="title" style={[globalStyles.text_primary, globalStyles.line_height_4xl]}>
          {course.title}
        </ThemedText>
        <View style={globalStyles.gap_sm}>
          <TextBody variant="body2" color='secondary' strong>
            {t('courses.topicsCount', { count: topicCount })}
            {' • '}
            {t('courses.lessonsCount', { count: lessonCount })}
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
        <TextBody variant="body1" color='tertiary' strong>{t('courses.description')}</TextBody>
        <TextBody variant="body2" color="secondary">
          {course.description.trim() || ''}
        </TextBody>
      </View>
    </View>
  );
}

