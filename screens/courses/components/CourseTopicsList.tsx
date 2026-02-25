import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography';
import type { StrapiLessonMinimal, StrapiTopicWithLessons } from '@/types/api';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { StyleSheet } from 'react-native';
import { EmptyTopicsMessage } from './EmptyTopicsMessage';

type CourseTopicsListProps = {
  topics: StrapiTopicWithLessons[];
};

function TopicLessonItem({ lesson }: { lesson: StrapiLessonMinimal }) {
  return (
    <ThemedView style={styles.lessonRow}>
      <TextBody variant="body2">• {lesson.title}</TextBody>
      {lesson.lesson_type ? (
        <TextBody variant="caption" color="secondary">
          {lesson.lesson_type}
        </TextBody>
      ) : null}
    </ThemedView>
  );
}

function TopicBlock({ topic }: { topic: StrapiTopicWithLessons }) {
  return (
    <ThemedView style={styles.topicBlock}>
      <ThemedText type="defaultSemiBold">{topic.title}</ThemedText>
      {topic.description ? (
        <TextBody variant="body2" color="secondary">
          {topic.description}
        </TextBody>
      ) : null}
      {topic.lessons?.map((lesson) => (
        <TopicLessonItem key={lesson.documentId} lesson={lesson} />
      ))}
    </ThemedView>
  );
}

export function CourseTopicsList({ topics }: CourseTopicsListProps) {
  if (topics.length === 0) {
    return <EmptyTopicsMessage />;
  }

  return (
    <>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Topics
      </ThemedText>
      {topics.map((topic) => (
        <TopicBlock key={topic.documentId} topic={topic} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: themeToken.spacing,
  },
  topicBlock: {
    marginBottom: themeToken.spacingLg,
    padding: themeToken.padding,
    backgroundColor: colors.background.tertiary,
    borderRadius: themeToken.borderRadius,
  },
  lessonRow: {
    marginTop: themeToken.spacingSm,
    marginLeft: themeToken.spacing,
  },
});
