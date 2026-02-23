import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import Button from '@/components/buttons/button';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TextBody } from '@/components/typography/textBody';
import BackButton from '@/components/buttons/backButton';
import { useCourseByDocumentId } from '@/hooks/useCourses';
import { useEnrollCourse } from '@/hooks/useEnrollments';
import { useAppSelector } from '@/hooks/useRedux';
import type { StrapiTopicWithLessons, StrapiLessonMinimal } from '@/types/api';
import colors from '@/utils/theme/colors';
import { themeToken } from '@/utils/theme/styles';

export default function CourseDetailScreen() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const locale = useAppSelector((s) => s.preferences.locale);
  const user = useAppSelector((s) => s.auth.user);
  const { course, isLoading, error } = useCourseByDocumentId(documentId ?? '', locale);
  const enrollMutation = useEnrollCourse({
    onSuccess: () => {},
  });

  if (!documentId) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Missing course id.</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Error loading course.</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading || !course) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const topics = (course.topics ?? []) as StrapiTopicWithLessons[];
  const isEnrolled =
    user?.enrollments?.some((e) => course.enrollments?.some((ce) => ce.id === e.id)) ?? false;

  return (
    <ThemedView style={styles.container}>
      <BackButton onPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>
          {course.title}
        </ThemedText>
        <TextBody variant="body1" color="secondary" style={styles.description}>
          {course.description || ''}
        </TextBody>
        {course.course_categories?.[0] && (
          <TextBody variant="caption" color="secondary">
            {course.course_categories[0].name}
          </TextBody>
        )}
        {user && !isEnrolled && (
          <Button
            type="primary"
            size="lg"
            label="Enroll"
            rounded
            loading={enrollMutation.isPending}
            onPress={() =>
              enrollMutation.mutate({
                users_permissions_user: user.id,
                course: course.id,
                locale,
                enrollment_status: 'Enrolled',
              })
            }
            overRiddingStyles={styles.enrollBtn}
          />
        )}
        {topics.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Topics
            </ThemedText>
            {topics.map((topic) => (
              <ThemedView key={topic.documentId} style={styles.topicBlock}>
                <ThemedText type="defaultSemiBold">{topic.title}</ThemedText>
                {topic.description ? (
                  <TextBody variant="body2" color="secondary">
                    {topic.description}
                  </TextBody>
                ) : null}
                {topic.lessons?.map((lesson: StrapiLessonMinimal) => (
                  <ThemedView key={lesson.documentId} style={styles.lessonRow}>
                    <TextBody variant="body2">• {lesson.title}</TextBody>
                    {lesson.lesson_type ? (
                      <TextBody variant="caption" color="secondary">
                        {lesson.lesson_type}
                      </TextBody>
                    ) : null}
                  </ThemedView>
                ))}
              </ThemedView>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: themeToken.paddingLg,
    paddingTop: themeToken.spacing,
  },
  title: {
    marginBottom: themeToken.spacing,
  },
  description: {
    marginBottom: themeToken.spacing,
  },
  enrollBtn: {
    marginTop: themeToken.spacing,
    marginBottom: themeToken.spacingLg,
  },
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeToken.paddingLg,
  },
});
