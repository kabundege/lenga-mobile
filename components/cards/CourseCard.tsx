import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiCourse } from '@/types/api';
import { DATE_FORMAT, formatToDateWithLocale } from '@/utils/functions/date';
import { flexBetween, flexEnd, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';
import { StyleSheet, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import Spacer from '../common/spacer';
import { TextBody, TextHeading } from '../typography';

const THUMBNAIL_HEIGHT = scale(100);
const BADGE_SIZE = scale(44);
const PILL_BG = '#3D4E9318';

const CourseCard = ({ course }: { course: StrapiCourse }) => {
  const locale = useAppSelector((s) => s.preferences.locale);

  return (
    <PressableScale
      onPress={() => router.push(`/courses/${course.documentId}`)}
      style={styles.card}
    >
      <View>
        <TextHeading variant='title' numberOfLines={2}>{course.title}</TextHeading>
        <TextBody variant="body1" color='secondary' numberOfLines={2}>{course.description}</TextBody>
      </View>

      <Spacer height={themeToken.spacingLg} />

      <View style={[flexBetween, styles.footer]}>
        <View>
          <TextBody variant='caption' color='tertiary' strong>Authors</TextBody>
          <TextBody variant='body2' strong>
            {course.authors?.map((author) => author.full_name).join(', ')}
          </TextBody>
        </View>
        <View style={[flexEnd, globalStyles.flex_col]}>
          <TextBody strong variant='caption' color='tertiary'>Ryakozwe</TextBody>
          <TextBody variant='body2' color="primary">
            {formatToDateWithLocale(course.createdAt, DATE_FORMAT, locale)}
          </TextBody>
        </View>
      </View>
    </PressableScale >
  );
};

export default CourseCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.tertiary,
    ...globalStyles.rounded_md,
    ...globalStyles.p_md,
  },
  footer: {
    ...globalStyles.pt_sm,
    ...globalStyles.border_t,
    borderColor: colors.primary,
  }
});
