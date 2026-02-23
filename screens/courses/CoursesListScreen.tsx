import { FlatList, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography/textBody';
import { useCourses } from '@/hooks/useCourses';
import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiCourse } from '@/types/api';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';

function CourseCard({ course }: { course: StrapiCourse }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/course/[documentId]', params: { documentId: course.documentId } })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <ThemedText type="subtitle" numberOfLines={1}>
        {course.title}
      </ThemedText>
      <TextBody variant="body2" color="secondary" numberOfLines={2}>
        {course.description || ''}
      </TextBody>
      {course.course_categories?.[0] ? (
        <TextBody variant="caption" color="secondary" style={styles.category}>
          {course.course_categories[0].name}
        </TextBody>
      ) : null}
    </Pressable>
  );
}

export default function CoursesListScreen() {
  const locale = useAppSelector((s) => s.preferences.locale);
  const { courses, isLoading, error, refetch } = useCourses(locale);

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="defaultSemiBold">Error loading courses.</ThemedText>
        <Pressable onPress={() => refetch()}>
          <TextBody variant="body2" color="primary">Retry</TextBody>
        </Pressable>
      </ThemedView>
    );
  }

  if (isLoading && courses.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Loading courses...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Courses
      </ThemedText>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.documentId}
        renderItem={({ item }) => <CourseCard course={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText>No courses yet.</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: themeToken.padding,
    paddingBottom: themeToken.spacingSm,
  },
  list: {
    padding: themeToken.padding,
    paddingTop: 0,
  },
  card: {
    padding: themeToken.padding,
    marginBottom: themeToken.spacing,
    backgroundColor: colors.background.tertiary,
    borderRadius: themeToken.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  cardPressed: {
    opacity: 0.8,
  },
  category: {
    marginTop: themeToken.spacingSm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
  },
});
