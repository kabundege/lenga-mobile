import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiCourse } from '@/types/api';
import { DATE_FORMAT, formatToDateWithLocale } from '@/utils/functions/date';
import { flexBetween, flexEnd, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';
import { StyleSheet, View } from 'react-native';
import { TextBody, TextHeading } from '../typography';

const CourseCard = ({ course }: { course: StrapiCourse }) => {
  const locale = useAppSelector((s) => s.preferences.locale);

  return (
    <PressableScale
      onPress={() => router.push(`/courses/${course.documentId}`)}
      style={styles.card}
    >
      <View style={globalStyles.p_md}>
        <TextHeading variant='title' numberOfLines={2}>{course.title}</TextHeading>
        <TextBody variant="body1" color='secondary' numberOfLines={2}>{course.description}</TextBody>
      </View>

      <View style={[flexBetween, styles.footer]}>
        <View>
          <TextBody variant='caption' color='tertiary' strong>Authors</TextBody>
          <TextBody variant='body2' strong>
            {course.authors?.map((author) => author.full_name).join(', ')}
          </TextBody>
        </View>
        <View style={[flexEnd, globalStyles.flex_col]}>
          <TextBody strong variant='overline' color='tertiary'>Ryakozwe</TextBody>
          <TextBody variant='caption'>
            {formatToDateWithLocale(course.createdAt, DATE_FORMAT, locale)}
          </TextBody>
        </View>
      </View>
    </PressableScale>
  );
};

export default CourseCard;

const styles = StyleSheet.create({
  card: {
    ...globalStyles.rounded_md,
    ...globalStyles.border_tertiary,
    ...globalStyles.overflow_hidden,
    backgroundColor: colors.background.primary,
  },
  footer: {
    ...globalStyles.p_md,
    ...globalStyles.border_t,
    ...globalStyles.rounded_b_md,
    borderColor: colors.border.primary,
    backgroundColor: colors.primary_light,
  }
});
