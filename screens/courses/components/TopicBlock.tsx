import Spacer from '@/components/common/spacer';
import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography';
import { Dimensions, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableOpacity } from 'pressto';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { CurvedTransition, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import type { TopicBlockProps } from './CourseTopicsList.types';
import { TopicLessonItem } from './TopicLessonItem';

const VISIBLE_LESSONS_WHEN_COLLAPSED = 3;

const styles = StyleSheet.create({
  topicBlock: {
    ...globalStyles.rounded_sm,
    ...globalStyles.overflow_hidden,
    backgroundColor: colors.background.secondary,
  },
  lessonsList: {
    ...StyleSheet.flatten([
      globalStyles.gap_2xs,
      globalStyles.m_xs,
      globalStyles.mt_0,
      globalStyles.rounded_sm,
      globalStyles.overflow_hidden,
    ]),
  },
  showMoreText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  showMoreButton: {
    ...globalStyles.w_full,
    ...globalStyles.center,
    ...globalStyles.h_input,
    ...globalStyles.absolute,
    ...globalStyles.bottom_0,
    ...globalStyles.items_center,
  },
});

export function TopicBlock({ topic, index }: TopicBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapsed = useCallback(() => setIsCollapsed((prev) => !prev), []);

  const lessons = topic.lessons ?? [];
  const canExpand = lessons.length > VISIBLE_LESSONS_WHEN_COLLAPSED;
  const visibleLessons =
    isCollapsed && canExpand
      ? lessons.slice(0, VISIBLE_LESSONS_WHEN_COLLAPSED)
      : lessons;
  const hiddenCount = lessons.length - VISIBLE_LESSONS_WHEN_COLLAPSED;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      exiting={FadeOutUp.delay(index * 100)}
      layout={CurvedTransition}
      style={styles.topicBlock}
    >
      <View style={[globalStyles.py_sm, globalStyles.px_md]}>
        <ThemedText type="defaultSemiBold" style={globalStyles.text_primary}>
          {topic.title}
        </ThemedText>
        {topic.description ? (
          <TextBody variant="body2" color="secondary">
            {topic.description}
          </TextBody>
        ) : null}
      </View>

      <View>
        {lessons.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(index * 100)}
            exiting={FadeOutUp.delay(index * 100)}
            style={styles.lessonsList}
            layout={CurvedTransition}
          >
            {visibleLessons.map((lesson, lessonIndex) => (
              <TopicLessonItem
                key={lesson.documentId}
                index={lessonIndex}
                lesson={lesson}
              />
            ))}
          </Animated.View>
        )}
        {canExpand && (
          <>
            <Spacer height={Dimensions.INPUT_HEIGHT * (isCollapsed ? 0.3 : 0.8)} />
            <PressableOpacity
              onPress={toggleCollapsed}
              style={styles.showMoreButton}
            >
              <LinearGradient
                // Background Linear Gradient
                colors={[colors.transparent, colors.background.secondary, colors.background.secondary]}
                style={[globalStyles.absolute, globalStyles.w_full, globalStyles.h_full]}
              />
              <TextBody center variant="body2" color="primary" style={styles.showMoreText}>
                {isCollapsed ? `Show more (${hiddenCount} more)` : 'Show less'}
              </TextBody>
            </PressableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );
}
