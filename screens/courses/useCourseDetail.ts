import { useCourseByDocumentId } from '@/hooks/useCourses';
import { useAppSelector } from '@/hooks/useRedux';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

export function useCourseDetail() {
  const params = useLocalSearchParams<{ courseId: string }>();
  const courseId =
    typeof params.courseId === 'string' ? params.courseId : params.courseId?.[0] ?? '';
  const locale = useAppSelector((s) => s.preferences.locale);

  const { course, isLoading, isRefetching, error, refetch } = useCourseByDocumentId(
    courseId,
    locale
  );

  const topics = useMemo(() => course?.topics ?? [], [course]);

  const topicCount = useMemo(() => course?.topics?.length ?? 0, [course]);
  const lessonCount = useMemo(() => course?.topics?.reduce((acc, topic) => acc + (topic.lessons?.length ?? 0), 0) ?? 0, [course]);


  return {
    courseId,
    course,
    locale,
    topics,
    topicCount,
    lessonCount,
    isLoading,
    isRefetching,
    error,
    refetch,
  };
}
