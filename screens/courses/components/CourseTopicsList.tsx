import IconButton from '@/components/buttons/iconButton';
import Chip from '@/components/common/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody, TextHeading } from '@/components/typography';
import type { StrapiLessonMinimal, StrapiTopicWithLessons } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { PressableOpacity } from 'pressto';
import { StyleSheet, View } from 'react-native';
import { EmptyTopicsMessage } from './EmptyTopicsMessage';

type CourseTopicsListProps = {
  topics: StrapiTopicWithLessons[];
};

interface TopicLessonItemProps {
  lesson: StrapiLessonMinimal;
  index: number;
}

const TopicLessonItem = ({ lesson, index }: TopicLessonItemProps) => {
  const isDownloaded = false;
  return (
    <PressableOpacity style={[flexBetween, globalStyles.p_sm]}>
      <View>
        <TextBody variant="body2">{lesson.title}</TextBody>
        <View style={[globalStyles.flex_row, globalStyles.gap_xs, globalStyles.items_center, globalStyles.flex_wrap]}>
          <TextBody style={[globalStyles.uppercase, globalStyles.font_500]} variant="caption" color="primary">
            {lesson.lesson_type} &middot; {lesson.locale}
          </TextBody>
          <Chip label={isDownloaded ? 'Course saved' : 'Course not saved'} size='xs' variant='filled' />
        </View>
      </View>
      <IconButton icon={isDownloaded ? 'download' : 'play'} iconType={isDownloaded ? 'material' : 'ionicons'} backgroundColor={colors.primary_light} iconFill={colors.primary} />
    </PressableOpacity>
  )
};

interface TopicBlockProps {
  topic: StrapiTopicWithLessons;
}

const TopicBlock = ({ topic }: TopicBlockProps) => {
  return (
    <ThemedView style={styles.topicBlock}>
      <View style={globalStyles.p_sm}>
        <ThemedText type="defaultSemiBold" style={globalStyles.text_primary}>{topic.title}</ThemedText>
        {topic.description ? (
          <TextBody variant="body2" color="secondary">
            {topic.description}
          </TextBody>
        ) : null}
      </View>
      <ThemedView style={styles.lessonsList}>
        {topic.lessons?.map((lesson, index) => (
          <TopicLessonItem key={lesson.documentId} lesson={lesson} index={index} />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

export const CourseTopicsList = ({ topics }: CourseTopicsListProps) => {
  if (topics.length === 0) {
    return <EmptyTopicsMessage />;
  }

  return (
    <View style={globalStyles.px_lg}>
      <TextHeading variant="title" style={styles.sectionTitle}>
        Topics
      </TextHeading>
      {topics.map((topic) => (
        <TopicBlock key={topic.documentId} topic={topic} />
      ))}
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
  lessonsList: StyleSheet.flatten([globalStyles.gap_2xs, globalStyles.m_xs, globalStyles.mt_xs, globalStyles.rounded_sm]),
});
