import IconButton from '@/components/buttons/iconButton';
import Chip from '@/components/common/chip';
import { LessonPlayerModal } from '@/components/modals';
import { TextBody } from '@/components/typography';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { PressableOpacity } from 'pressto';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { CurvedTransition, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import type { TopicLessonItemProps } from './CourseTopicsList.types';
import { getLessonMediaUrl } from './courseLessonUtils';

export function TopicLessonItem({ lesson, index }: TopicLessonItemProps) {
  const { t } = useTranslation();
  const isDownloaded = false;
  const mediaUrl = useMemo(() => getLessonMediaUrl(lesson), [lesson]);

  const icon = !mediaUrl ? 'error' : isDownloaded ? 'download' : 'play';
  const iconType = !mediaUrl ? 'materialIcons' : isDownloaded ? 'material' : 'ionicons';

  return (
    <LessonPlayerModal
      lesson={lesson}
      toggleBtn={
        ({ onPress }) => (
          <PressableOpacity
            onPress={onPress}
            entering={FadeInDown.delay(index * 100)}
            exiting={FadeOutUp.delay(index * 100)}
            layout={CurvedTransition}
            style={[flexBetween, globalStyles.p_sm, globalStyles.bg_background]}
          >
            <View>
              <TextBody variant="body2">{lesson.title}</TextBody>
              <View
                style={[
                  globalStyles.flex_row,
                  globalStyles.gap_xs,
                  globalStyles.items_center,
                  globalStyles.flex_wrap,
                ]}
              >
                <TextBody
                  style={[globalStyles.uppercase, globalStyles.font_500]}
                  variant="caption"
                  color="primary"
                >
                  {lesson.lesson_type} &middot; {lesson.locale}
                </TextBody>
                <Chip
                  label={isDownloaded ? t('courses.courseSaved') : t('courses.courseNotSaved')}
                  size="xs"
                  variant="filled"
                />
              </View>
            </View>
            <IconButton
              icon={icon}
              iconType={iconType}
              backgroundColor={colors.primary_light}
              iconFill={colors.primary}
            />
          </PressableOpacity>
        )
      }
    />
  );
}
