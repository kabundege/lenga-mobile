import IconButton from '@/components/buttons/iconButton';
import { AnimatedSearchBar } from '@/components/inputs/animatedSearchBar';
import { TextHeading } from '@/components/typography';
import type { StrapiTopicWithLessons } from '@/types/api';
import { flexBetween, globalStyles } from '@/utils/styles';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';
import { useMemo, useState } from 'react';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { CurvedTransition } from 'react-native-reanimated';
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
  const { t } = useTranslation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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

  if (topics.length === 0) {
    return <EmptyTopicsMessage />;
  }

  return (
    <View style={globalStyles.px_lg}>
      <View>
        <View style={[flexBetween, globalStyles.flex_row, styles.headerRow]}>
          <TextHeading variant="title" style={styles.sectionTitle}>
            {t('courses.topics')}
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
          placeholder={t('courses.searchPlaceholder')}
        />
      </View>

      {filteredTopics.length === 0 && search.trim().length > 0 ? (
        <EmptyTopicsMessage variant="searchEmpty" />
      ) : (
        <Animated.View layout={CurvedTransition} style={globalStyles.gap_md}>
          {filteredTopics.map((topic, index) => (
            <TopicBlock
              index={index}
              topic={topic}
              key={topic.documentId}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}
