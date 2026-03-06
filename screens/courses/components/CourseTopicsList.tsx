import IconButton from '@/components/buttons/iconButton';
import { AnimatedSearchBar } from '@/components/inputs/animatedSearchBar';
import { TextHeading } from '@/components/typography';
import type { StrapiLessonMinimal, StrapiTopicWithLessons } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import type { LessonPlayerModalRef } from '@/utils/types/modals';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import Animated, { CurvedTransition } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import { getLessonMediaUrl } from './courseLessonUtils';
import type { CourseTopicsListProps } from './CourseTopicsList.types';
import { EmptyTopicsMessage } from './EmptyTopicsMessage';
import { TopicBlock } from './TopicBlock';

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
  },
  sectionTitle: {
    marginVertical: themeToken.spacing,
  },
});

function filterTopicsWithLessons(
  topics: CourseTopicsListProps['topics']
): CourseTopicsListProps['topics'] {
  return topics.filter(
    (topic) =>
      topic.lessons?.length &&
      topic.lessons.length > 0 &&
      topic.title &&
      topic.description
  );
}

export function CourseTopicsList({ topics }: CourseTopicsListProps) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<StrapiLessonMinimal | null>(null);
  const lessonPlayerModalRef = useRef<LessonPlayerModalRef>(null);

  const { control } = useForm<FieldValues>({
    defaultValues: {
      search: '',
    },
  });

  const search = useWatch({ control, name: 'search' });

  const topicsWithLessons = useMemo(
    () => filterTopicsWithLessons(topics),
    [topics]
  );

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topicsWithLessons;
    return topicsWithLessons
      .map((topic): StrapiTopicWithLessons | null => {
        const topicMatches =
          topic.title?.toLowerCase().includes(q) ||
          topic.description?.toLowerCase().includes(q);
        const lessonsFiltered = (topic.lessons ?? []).filter((l) =>
          l.title?.toLowerCase().includes(q)
        );
        const includeTopic = topicMatches || lessonsFiltered.length > 0;
        if (!includeTopic) return null;
        return {
          ...topic,
          lessons: topicMatches ? (topic.lessons ?? []) : lessonsFiltered,
        };
      })
      .filter((t): t is StrapiTopicWithLessons => t != null);
  }, [topicsWithLessons, search]);

  const openLesson = useCallback((lesson: StrapiLessonMinimal) => {
    const mediaUrl = getLessonMediaUrl(lesson);
    if (!mediaUrl) {
      toast.error('This lesson does not have a playable media yet.');
      return;
    }
    setSelectedLesson(lesson);
    lessonPlayerModalRef.current?.present();
  }, []);

  const closeLessonModal = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  if (topics.length === 0) {
    return <EmptyTopicsMessage />;
  }

  return (
    <View style={globalStyles.px_lg}>
      <View>
        <View style={[flexBetween, globalStyles.flex_row, styles.headerRow]}>
          <TextHeading variant="title" style={styles.sectionTitle}>
            Topics
          </TextHeading>
          <IconButton
            size="sm"
            iconType="antd"
            iconFill={colors.primary}
            backgroundColor={colors.primary_light}
            icon={isSearchVisible ? "close" : "search"}
            onPress={() => setIsSearchVisible((v) => !v)}
          />
        </View>
        <AnimatedSearchBar
          name="search"
          isClearable
          marginBottom={0}
          control={control}
          visible={isSearchVisible}
          onVisibilityChange={setIsSearchVisible}
          placeholder="Search topics and lessons..."
        />
      </View>

      <Animated.View layout={CurvedTransition} style={globalStyles.gap_md}>
        {filteredTopics.map((topic, index) => (
          <TopicBlock
            index={index}
            topic={topic}
            key={topic.documentId}
          />
        ))}
      </Animated.View>


    </View>
  );
}
