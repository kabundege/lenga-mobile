import IconButton from '@/components/buttons/iconButton';
import Chip from '@/components/common/chip';
import LessonPlayerModal from '@/components/modals/LessonPlayerModal';
import { ThemedText } from '@/components/themed-text';
import { TextBody, TextHeading } from '@/components/typography';
import type { StrapiLessonMinimal, StrapiTopicWithLessons } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import type { LessonPlayerModalRef } from '@/utils/types/modals';
import { PressableOpacity } from 'pressto';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { CurvedTransition, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import { EmptyTopicsMessage } from './EmptyTopicsMessage';

type CourseTopicsListProps = {
  topics: StrapiTopicWithLessons[];
};

interface TopicLessonItemProps {
  lesson: StrapiLessonMinimal;
  index: number;
  onPressLesson: (lesson: StrapiLessonMinimal) => void;
}

function getLessonMediaUrl(lesson: StrapiLessonMinimal) {
  return (
    lesson.video_lesson_details?.video_url ??
    lesson.lesson_details?.video_url ??
    ''
  );
}

const TopicLessonItem = ({ lesson, index, onPressLesson }: TopicLessonItemProps) => {
  const isDownloaded = false;

  const mediaUrl = useMemo(() => getLessonMediaUrl(lesson), [lesson]);
  const onPress = useCallback(() => onPressLesson(lesson), [lesson, onPressLesson]);

  return (
    <PressableOpacity
      onPress={onPress}
      entering={FadeInDown.delay(index * 100)} exiting={FadeOutUp.delay(index * 100)} layout={CurvedTransition}
      style={[flexBetween, globalStyles.p_sm, globalStyles.bg_background]}
    >
      <View>
        <TextBody variant="body2">{lesson.title}</TextBody>
        <View style={[globalStyles.flex_row, globalStyles.gap_xs, globalStyles.items_center, globalStyles.flex_wrap]}>
          <TextBody style={[globalStyles.uppercase, globalStyles.font_500]} variant="caption" color="primary">
            {lesson.lesson_type} &middot; {lesson.locale}
          </TextBody>
          <Chip label={isDownloaded ? 'Course saved' : 'Course not saved'} size='xs' variant='filled' />
        </View>
      </View>
      <IconButton
        icon={!mediaUrl ? 'error' : isDownloaded ? 'download' : 'play'}
        iconType={!mediaUrl ? 'materialIcons' : isDownloaded ? 'material' : 'ionicons'}
        backgroundColor={colors.primary_light}
        iconFill={colors.primary}
      />
    </PressableOpacity>
  )
};

interface TopicBlockProps {
  index: number;
  topic: StrapiTopicWithLessons;
  onPressLesson: (lesson: StrapiLessonMinimal) => void;
}

const TopicBlock = ({ topic, index, onPressLesson }: TopicBlockProps) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100)}
    exiting={FadeOutUp.delay(index * 100)}
    layout={CurvedTransition}
    style={styles.topicBlock}
  >
    <View style={[globalStyles.py_sm, globalStyles.px_md]}>
      <ThemedText type="defaultSemiBold" style={globalStyles.text_primary}>{topic.title}</ThemedText>
      {topic.description ? (
        <TextBody variant="body2" color="secondary">
          {topic.description}
        </TextBody>
      ) : null}
    </View>
    {
      topic.lessons && topic.lessons.length > 0 ? (
        <Animated.View
          entering={FadeInDown.delay(index * 100)}
          exiting={FadeOutUp.delay(index * 100)}
          style={styles.lessonsList}
          layout={CurvedTransition}
        >
          {topic.lessons?.map((lesson, index) => (
            <TopicLessonItem
              index={index}
              lesson={lesson}
              key={lesson.documentId}
              onPressLesson={onPressLesson}
            />
          ))}
        </Animated.View>
      ) : null
    }
  </Animated.View>
);

export const CourseTopicsList = ({ topics }: CourseTopicsListProps) => {
  if (topics.length === 0) {
    return <EmptyTopicsMessage />;
  }

  const topicsWithLessons = useMemo(() => topics.filter((topic) => topic.lessons && topic.lessons.length > 0 && topic.title && topic.description), [topics]);

  const lessonPlayerModalRef = useRef<LessonPlayerModalRef>(null);
  const [selectedLesson, setSelectedLesson] = useState<StrapiLessonMinimal | null>(null);

  const openLesson = useCallback((lesson: StrapiLessonMinimal) => {
    const mediaUrl = getLessonMediaUrl(lesson);
    if (!mediaUrl) {
      toast.error('This lesson does not have a playable media yet.');
      return;
    }
    setSelectedLesson(lesson);
    lessonPlayerModalRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  return (
    <View style={globalStyles.px_lg}>
      <TextHeading variant="title" style={styles.sectionTitle}>
        Topics
      </TextHeading>
      <Animated.View layout={CurvedTransition} style={globalStyles.gap_md}>
        {topicsWithLessons.map((topic, index) => (
          <TopicBlock key={topic.documentId} index={index} topic={topic} onPressLesson={openLesson} />
        ))}
      </Animated.View>

      <LessonPlayerModal
        ref={lessonPlayerModalRef}
        lesson={selectedLesson}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginVertical: themeToken.spacing,
  },
  topicBlock: {
    ...globalStyles.rounded_sm,
    backgroundColor: colors.background.secondary,
  },
  lessonsList: {
    ...StyleSheet.flatten([globalStyles.gap_2xs, globalStyles.m_xs, globalStyles.mt_0, globalStyles.rounded_sm, globalStyles.overflow_hidden]),
  },
  disabledLesson: {
    opacity: 0.6,
  },
});
