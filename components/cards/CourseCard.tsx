import { useMe } from '@/hooks/useAuth';
import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiCourse } from '@/types/api';
import { DATE_FORMAT, formatToDateWithLocale } from '@/utils/functions/date';
import { flexBetween, flexEnd, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { router } from 'expo-router';
import { PressableScale } from 'pressto';
import { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { TextBody, TextHeading } from '../typography';

interface CourseCardProps {
  index: number;
  course: StrapiCourse;
  style?: StyleProp<ViewStyle>;
}

const CourseCard = ({ index, course, style }: CourseCardProps) => {
  const { user } = useMe();
  const locale = useAppSelector((s) => s.preferences.locale);
  const isEnrolled = useMemo(() => course.documentId === user?.documentId, [user, course]);

  return (
    <PressableScale
      onPress={() => router.push(`/courses/${course.documentId}`)}
      style={[styles.card, style]}
      entering={FadeInDown.delay(index * 100)}
    >
      <View style={globalStyles.p_md}>
        <View style={globalStyles.flex_row}>
          <TextHeading variant='title' numberOfLines={2}>{course.title}</TextHeading>
          {isEnrolled && (
            <View style={globalStyles.p_xs}>
              <TextBody variant='caption' color='tertiary' strong>Enrolled</TextBody>
            </View>
          )}
        </View>
        <TextBody variant="body1" color='secondary' numberOfLines={2}>{course.description}</TextBody>
      </View>

      <View style={[flexBetween, styles.footer]}>
        <View style={[globalStyles.flex_1]}>
          <TextBody variant='caption' color='tertiary' strong>Authors</TextBody>
          <TextBody variant='body2' strong numberOfLines={1}>
            {Array(5).fill(course.authors).flat().map((author) => author?.full_name).join(', ')}
          </TextBody>
        </View>
        <View style={[flexEnd, globalStyles.flex_col, globalStyles.w_50]}>
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
